import { RefreshCw } from "lucide-react";
import MailList from "../components/MailList";

import "./SimpleFolder.css"

export default function SimpleFolder({
  title,
  description,
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

          <h1>{title}</h1>

          <p className="muted">
            {description}
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={onRefresh}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
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