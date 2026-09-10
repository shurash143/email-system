import {
  Star,
  Trash2,
  Paperclip,
  MailOpen,
} from "lucide-react";
import "./MailList.css"

function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export default function MailList({
  emails = [],
  loading,
  onOpen,
  onStar,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="loader">
        Loading emails...
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="empty-state">
        <MailOpen size={42} />

        <h3>No emails found</h3>

        <p>
          Your mailbox is empty or no emails
          match your search.
        </p>
      </div>
    );
  }

  return (
    <div className="mail-list">
      {emails.map((email) => {
        const id = email._id || email.id;

        const sender =
          email.from?.name ||
          email.from ||
          "Unknown sender";

        const subject =
          email.subject || "(No subject)";

        const preview =
          email.text ||
          email.body ||
          "No message preview";

        return (
          <div
            key={id}
            className={`mail-row ${
              email.read ? "" : "unread"
            }`}
            onClick={() => onOpen(email)}
          >
            <button
              className={`star-btn ${
                email.starred ? "starred" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onStar(email);
              }}
              title="Star"
            >
              <Star size={18} />
            </button>

            <div className="sender">
              <div className="sender-avatar">
                {String(sender)
                  .slice(0, 1)
                  .toUpperCase()}
              </div>

              <strong>{sender}</strong>
            </div>

            <div className="mail-main">
              <strong className="subject">
                {subject}
              </strong>

              <span className="preview">
                {preview.slice(0, 100)}
                {preview.length > 100 ? "..." : ""}
              </span>
            </div>

            {email.attachments?.length > 0 && (
              <Paperclip size={16} />
            )}

            <span className="mail-date">
              {formatDate(
                email.createdAt ||
                  email.date ||
                  email.sentAt
              )}
            </span>

            <button
              className="row-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(email);
              }}
              title="Move to trash"
            >
              <Trash2 size={17} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
