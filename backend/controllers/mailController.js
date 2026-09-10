import nodemailer from "nodemailer";
import Mail from "../models/Mail.js";

/*
|--------------------------------------------------------------------------
| Shared mailbox
|--------------------------------------------------------------------------
*/

const getGroupEmail = () => {
  return (
    process.env.GROUP_EMAIL ||
    process.env.IMAP_USER ||
    "info@multimodalcargo.co.ke"
  );
};

/*
|--------------------------------------------------------------------------
| Sender email
|--------------------------------------------------------------------------
*/

const getSenderEmail = () => {
  return (
    process.env.SMTP_USER ||
    process.env.GROUP_EMAIL ||
    "info@multimodalcargo.co.ke"
  );
};

/*
|--------------------------------------------------------------------------
| Normalize email addresses
|--------------------------------------------------------------------------
*/

const normalizeEmails = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeEmails(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  }

  if (typeof value === "object") {
    if (value.address) {
      return [value.address];
    }

    if (Array.isArray(value.value)) {
      return value.value
        .map((item) => item.address || item)
        .filter(Boolean);
    }
  }

  return [];
};

/*
|--------------------------------------------------------------------------
| Create SMTP transporter
|--------------------------------------------------------------------------
*/

const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error("SMTP settings are missing.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT || 587),

    secure:
      String(process.env.SMTP_SECURE).toLowerCase() === "true",

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET /mail
|--------------------------------------------------------------------------
| Get emails from the shared company mailbox
|--------------------------------------------------------------------------
*/

export const getMail = async (req, res) => {
  try {
    const {
      folder = "inbox",
      starred,
      search,
    } = req.query;

    const mailbox = getGroupEmail();

    const filter = {
      mailbox,
      folder,
    };

    /*
     * Starred messages
     */
    if (starred === "true") {
      filter.starred = true;
    }

    /*
     * Search
     */
    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        {
          subject: searchRegex,
        },
        {
          text: searchRegex,
        },
        {
          "from.email": searchRegex,
        },
        {
          "from.address": searchRegex,
        },
      ];
    }

    const messages = await Mail.find(filter)
      .sort({
        receivedAt: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error(
      "Get mail error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch emails.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /mail/:id
|--------------------------------------------------------------------------
| Get one email
|--------------------------------------------------------------------------
*/

export const getMailById = async (req, res) => {
  try {
    const { id } = req.params;

    const mailbox = getGroupEmail();

    const mail = await Mail.findOne({
      _id: id,
      mailbox,
    });

    if (!mail) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    /*
     * Mark as read when opened
     */
    if (!mail.read) {
      mail.read = true;
      await mail.save();
    }

    return res.status(200).json({
      success: true,
      mail,
    });
  } catch (error) {
    console.error(
      "Get mail by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch email.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /mail/:id/star
|--------------------------------------------------------------------------
| Star / unstar an email
|--------------------------------------------------------------------------
*/

export const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;

    const mailbox = getGroupEmail();

    const mail = await Mail.findOne({
      _id: id,
      mailbox,
    });

    if (!mail) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    mail.starred = !mail.starred;

    await mail.save();

    return res.status(200).json({
      success: true,
      message: mail.starred
        ? "Email starred."
        : "Email unstarred.",
      mail,
    });
  } catch (error) {
    console.error(
      "Toggle star error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update star.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /mail/:id/move
|--------------------------------------------------------------------------
| Move an email between folders
|--------------------------------------------------------------------------
*/

export const moveMail = async (req, res) => {
  try {
    const { id } = req.params;
    const { folder } = req.body;

    const allowedFolders = [
      "inbox",
      "sent",
      "drafts",
      "trash",
      "archive",
    ];

    if (!folder) {
      return res.status(400).json({
        success: false,
        message: "Folder is required.",
      });
    }

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        success: false,
        message: "Invalid folder.",
      });
    }

    const mailbox = getGroupEmail();

    const mail = await Mail.findOne({
      _id: id,
      mailbox,
    });

    if (!mail) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    mail.folder = folder;

    await mail.save();

    return res.status(200).json({
      success: true,
      message: `Email moved to ${folder}.`,
      mail,
    });
  } catch (error) {
    console.error(
      "Move mail error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to move email.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| POST /mail/send
|--------------------------------------------------------------------------
| Send an email through Hostiko SMTP
|--------------------------------------------------------------------------
*/

export const sendMail = async (req, res) => {
  try {
    const {
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
    } = req.body;

    /*
     * Validate recipient
     */
    const toEmails = normalizeEmails(to);
    const ccEmails = normalizeEmails(cc);
    const bccEmails = normalizeEmails(bcc);

    if (toEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient is required.",
      });
    }

    /*
     * Validate subject/body
     */
    if (!subject && !text && !html) {
      return res.status(400).json({
        success: false,
        message: "Email subject or message is required.",
      });
    }

    /*
     * Create SMTP transporter
     */
    const transporter = createTransporter();

    const senderEmail = getSenderEmail();

    /*
     * Prepare email
     */
    const mailOptions = {
      from: {
        name:
          process.env.COMPANY_NAME ||
          "Cargo Company",
        address: senderEmail,
      },

      to: toEmails,

      ...(ccEmails.length > 0 && {
        cc: ccEmails,
      }),

      ...(bccEmails.length > 0 && {
        bcc: bccEmails,
      }),

      subject:
        subject?.trim() || "(No subject)",

      text: text || "",

      html:
        html ||
        (text
          ? `<p>${text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br>")}</p>`
          : undefined),

      /*
       * Only include attachments if supplied.
       */
      ...(Array.isArray(attachments) &&
        attachments.length > 0 && {
          attachments,
        }),
    };

    /*
     * Send through Hostiko
     */
    const info =
      await transporter.sendMail(
        mailOptions
      );

    /*
     * Save sent email in MongoDB
     */
    const savedMail = await Mail.create({
      messageId:
        info.messageId || "",

      from: {
        name:
          process.env.COMPANY_NAME ||
          "Cargo Company",

        address: senderEmail,
      },

      to: toEmails,

      cc: ccEmails,

      bcc: bccEmails,

      subject:
        subject?.trim() || "(No subject)",

      text: text || "",

      html: html || "",

      folder: "sent",

      starred: false,

      read: true,

      attachments:
        Array.isArray(attachments)
          ? attachments.map((attachment) => ({
              filename:
                attachment.filename || "",

              contentType:
                attachment.contentType ||
                attachment.contentType ||
                "",

              size:
                Number(attachment.size) || 0,

              path:
                attachment.path || "",
            }))
          : [],

      /*
       * The employee who sent the email
       * can still be recorded.
       */
      owner:
        req.user?._id || undefined,

      /*
       * But the mailbox is the shared company
       * mailbox.
       */
      mailbox: getGroupEmail(),

      sentAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Email sent successfully.",
      mail: savedMail,
    });
  } catch (error) {
    console.error(
      "Send mail error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send email.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| POST /mail/draft
|--------------------------------------------------------------------------
| Save an email as a draft
|--------------------------------------------------------------------------
*/

export const saveDraft = async (req, res) => {
  try {
    const {
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
    } = req.body;

    const toEmails = normalizeEmails(to);
    const ccEmails = normalizeEmails(cc);
    const bccEmails = normalizeEmails(bcc);

    const draft = await Mail.create({
      from: {
        name:
          process.env.COMPANY_NAME ||
          "Multimodal Cargo Company",

        address: getSenderEmail(),
      },

      to: toEmails,

      cc: ccEmails,

      bcc: bccEmails,

      subject:
        subject?.trim() || "",

      text: text || "",

      html: html || "",

      folder: "drafts",

      starred: false,

      read: true,

      attachments:
        Array.isArray(attachments)
          ? attachments.map((attachment) => ({
              filename:
                attachment.filename || "",

              contentType:
                attachment.contentType || "",

              size:
                Number(attachment.size) || 0,

              path:
                attachment.path || "",
            }))
          : [],

      /*
       * Record who created the draft.
       */
      owner:
        req.user?._id || undefined,

      /*
       * Draft belongs to the CargoMail
       * shared mailbox.
       */
      mailbox: getGroupEmail(),
    });

    return res.status(201).json({
      success: true,
      message: "Draft saved successfully.",
      mail: draft,
    });
  } catch (error) {
    console.error(
      "Save draft error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save draft.",
      error: error.message,
    });
  }
};