import nodemailer from "nodemailer";

/* =========================================================
   SMTP TRANSPORTER
========================================================= */

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),

  secure:
    String(process.env.SMTP_SECURE).toLowerCase() === "true" ||
    Number(process.env.SMTP_PORT || 465) === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

/* =========================================================
   VERIFY SMTP CONNECTION
========================================================= */

export const verifySMTP = async () => {
  try {
    await smtpTransporter.verify();

    console.log("✅ SMTP connection successful.");

    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:");
    console.error(error.message);

    return false;
  }
};

/* =========================================================
   SEND EMAIL
========================================================= */

export const sendEmail = async ({
  to,
  subject,
  text = "",
  html = "",
  from = process.env.SMTP_FROM || process.env.SMTP_USER,
  replyTo,
  attachments = [],
}) => {
  try {
    if (!to) {
      throw new Error("Recipient email address is required.");
    }

    if (!subject) {
      throw new Error("Email subject is required.");
    }

    const mailOptions = {
      from,
      to,
      subject,
      text,
      html,
      attachments,
    };

    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    const info = await smtpTransporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully.");
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(error.message);

    throw error;
  }
};

/* =========================================================
   SEND HTML EMAIL
========================================================= */

export const sendHtmlEmail = async ({
  to,
  subject,
  html,
  text = "",
  replyTo,
}) => {
  return sendEmail({
    to,
    subject,
    text,
    html,
    replyTo,
  });
};

/* =========================================================
   SEND TEXT EMAIL
========================================================= */

export const sendTextEmail = async ({
  to,
  subject,
  text,
  replyTo,
}) => {
  return sendEmail({
    to,
    subject,
    text,
    replyTo,
  });
};

/* =========================================================
   EXPORT TRANSPORTER
========================================================= */

export default smtpTransporter;