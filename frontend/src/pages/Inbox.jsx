import { RefreshCw, Plus } from "lucide-react";
import MailList from "../components/MailList";
import "./Inbox.css"

export default function Inbox({
  emails,
  loading,
  onOpen,
  onStar,
  onDelete,
  onRefresh,
}) {
  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAILBOX</span>

          <h1>Inbox</h1>

          <p className="muted">
            Manage incoming company emails and
            shipping communications.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="secondary-btn"
            onClick={onRefresh}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="primary-btn"
            onClick={() =>
              window.dispatchEvent(
                new Event("open-compose")
              )
            }
          >
            <Plus size={17} />
            Compose
          </button>
        </div>
      </div>

      <MailList
        emails={emails}
        loading={loading}
        onOpen={onOpen}
        onStar={onStar}
        onDelete={onDelete}
      />
    </section>
  );
}