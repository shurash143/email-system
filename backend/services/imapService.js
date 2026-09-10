import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import Mail from "../models/Mail.js";

const getMailboxAddress = () =>
  process.env.GROUP_EMAIL ||
  process.env.IMAP_USER ||
  "info@multimodal.co.ke";

const createIMAPClient = () => {
  return new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),

    secure:
      String(process.env.IMAP_SECURE).toLowerCase() === "true",

    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS,
    },

    logger: false,
  });
};

const addressToString = (address) => {
  if (!address) return "";

  if (typeof address === "string") {
    return address;
  }

  if (address.name && address.address) {
    return `${address.name} <${address.address}>`;
  }

  return address.address || "";
};

const addressesToArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(addressToString);
  }

  if (value.value && Array.isArray(value.value)) {
    return value.value.map(addressToString);
  }

  return [];
};

export const syncInbox = async () => {
  if (
    !process.env.IMAP_HOST ||
    !process.env.IMAP_USER ||
    !process.env.IMAP_PASS
  ) {
    console.log("IMAP is not configured.");

    return {
      success: false,
      imported: 0,
      message: "IMAP settings are missing.",
    };
  }

  const client = createIMAPClient();

  let imported = 0;

  try {
    await client.connect();

    console.log("Connected to IMAP server.");

    const mailbox =
      process.env.IMAP_MAILBOX || "INBOX";

    const lock = await client.getMailboxLock(mailbox);

    try {
      /*
       * Get actual UIDs from the mailbox.
       *
       * This is better than using status.messages because
       * message count and UID are not always the same.
       */
      const uids = await client.search(
        {
          all: true,
        },
        {
          uid: true,
        }
      );

      if (!uids || uids.length === 0) {
        console.log("IMAP inbox is empty.");

        return {
          success: true,
          imported: 0,
        };
      }

      /*
       * Only check the latest 100 messages.
       */
      const recentUids = uids.slice(-100);

      console.log(
        `Checking ${recentUids.length} IMAP messages...`
      );

      for await (const message of client.fetch(
        recentUids,
        {
          uid: true,
          source: true,
          internalDate: true,
        },
        {
          uid: true,
        }
      )) {
        try {
          const uid = message.uid;

          if (!uid) {
            continue;
          }

          /*
           * Prevent duplicate messages.
           */
          const existing = await Mail.findOne({
            mailbox: getMailboxAddress(),
            externalUid: uid,
          });

          if (existing) {
            continue;
          }

          if (!message.source) {
            continue;
          }

          /*
           * Convert raw email into a readable object.
           */
          const parsed = await simpleParser(
            message.source
          );

          const from =
            parsed.from?.value?.[0]
              ? {
                  name:
                    parsed.from.value[0].name || "",

                  address:
                    parsed.from.value[0].address || "",
                }
              : "";

          const to = addressesToArray(
            parsed.to
          );

          const cc = addressesToArray(
            parsed.cc
          );

          const bcc = addressesToArray(
            parsed.bcc
          );

          const attachments =
            (parsed.attachments || []).map(
              (attachment) => ({
                filename:
                  attachment.filename || "",

                contentType:
                  attachment.contentType || "",

                size:
                  attachment.size || 0,

                /*
                 * We are not storing attachment files
                 * yet. We can add that later.
                 */
                path: "",
              })
            );

          await Mail.create({
            messageId:
              parsed.messageId || "",

            from,

            to,

            cc,

            bcc,

            subject:
              parsed.subject || "(No subject)",

            text:
              parsed.text || "",

            html:
              parsed.html || "",

            folder: "inbox",

            starred: false,

            read: false,

            attachments,

            /*
             * Incoming shared mailbox emails are not
             * owned by one particular employee.
             */
            owner: undefined,

            mailbox: getMailboxAddress(),

            receivedAt:
              parsed.date ||
              message.internalDate ||
              new Date(),

            externalUid: uid,
          });

          imported++;

          console.log(
            `IMAP imported: ${
              parsed.subject || "(No subject)"
            }`
          );
        } catch (error) {
          console.error(
            "Error importing IMAP message:",
            error.message
          );
        }
      }
    } finally {
      lock.release();
    }

    console.log(
      `IMAP sync complete. Imported: ${imported}`
    );

    return {
      success: true,
      imported,
    };
  } catch (error) {
    console.error(
      "IMAP connection error:",
      error.message
    );

    return {
      success: false,
      imported,
      error: error.message,
    };
  } finally {
    try {
      await client.logout();
    } catch {
      // Ignore logout errors.
    }
  }
};

export const testIMAP = async () => {
  if (
    !process.env.IMAP_HOST ||
    !process.env.IMAP_USER ||
    !process.env.IMAP_PASS
  ) {
    console.log(
      "IMAP cannot be tested because settings are missing."
    );

    return false;
  }

  const client = createIMAPClient();

  try {
    await client.connect();

    console.log("IMAP connection successful.");

    await client.logout();

    return true;
  } catch (error) {
    console.error(
      "IMAP connection failed:",
      error.message
    );

    return false;
  }
};