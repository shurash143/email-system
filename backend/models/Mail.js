import mongoose from "mongoose";

const mailSchema = new mongoose.Schema(
  {
    // =========================================================
    // REAL EMAIL SERVER MESSAGE ID
    // =========================================================
    messageId: {
      type: String,
      default: "",
      index: true,
    },

    // =========================================================
    // SENDER
    // =========================================================
    from: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    // =========================================================
    // RECIPIENTS
    // =========================================================
    to: {
      type: [String],
      default: [],
    },

    cc: {
      type: [String],
      default: [],
    },

    bcc: {
      type: [String],
      default: [],
    },

    // =========================================================
    // EMAIL CONTENT
    // =========================================================
    subject: {
      type: String,
      default: "",
      trim: true,
    },

    text: {
      type: String,
      default: "",
    },

    html: {
      type: String,
      default: "",
    },

    // =========================================================
    // CARGOMAIL FOLDER
    // =========================================================
    folder: {
      type: String,
      enum: [
        "inbox",
        "sent",
        "drafts",
        "trash",
        "archive",
      ],
      default: "inbox",
      index: true,
    },

    // =========================================================
    // STARRED
    // =========================================================
    starred: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =========================================================
    // READ / UNREAD
    // =========================================================
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =========================================================
    // ATTACHMENTS
    // =========================================================
    attachments: [
      {
        filename: {
          type: String,
          default: "",
        },

        contentType: {
          type: String,
          default: "",
        },

        size: {
          type: Number,
          default: 0,
        },

        path: {
          type: String,
          default: "",
        },
      },
    ],

    // =========================================================
    // EMPLOYEE WHO PERFORMED THE ACTION
    //
    // Optional because incoming emails belong to the
    // shared company mailbox rather than one employee.
    // =========================================================
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    // =========================================================
    // SHARED COMPANY MAILBOX
    // =========================================================
    mailbox: {
      type: String,
      default: "info@multimodalcargo.co.ke",
      index: true,
      lowercase: true,
      trim: true,
    },

    // =========================================================
    // SMTP INFORMATION
    // =========================================================
    sentAt: {
      type: Date,
      default: null,
    },

    // =========================================================
    // IMAP INFORMATION
    // =========================================================
    receivedAt: {
      type: Date,
      default: null,
    },

    // =========================================================
    // IMAP UID
    // =========================================================
    externalUid: {
      type: Number,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// TEXT SEARCH
// =========================================================

mailSchema.index({
  subject: "text",
  text: "text",
});

// =========================================================
// PREVENT DUPLICATE IMAP IMPORTS
// =========================================================

mailSchema.index(
  {
    mailbox: 1,
    externalUid: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

export default mongoose.model("Mail", mailSchema);