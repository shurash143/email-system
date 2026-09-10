import { useState } from "react";
import {
  X,
  Minus,
  Maximize2,
  Paperclip,
  Send,
} from "lucide-react";
import "./ComposeModal.css"

export default function ComposeModal({
  onClose,
  onSend,
  onSave,
}) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim()) {
      alert("Please enter a recipient.");
      return;
    }

    setSending(true);

    try {
      await onSend({
        to,
        cc,
        subject,
        text,
      });
    } finally {
      setSending(false);
    }
  };

  const handleSave = async () => {
    await onSave({
      to,
      cc,
      subject,
      text,
    });
  };

  return (
    <div className="compose-overlay">
      <div className="compose-window">
        <div className="compose-head">
          <strong>New Message</strong>

          <div>
            <button
              className="icon-btn"
              title="Minimize"
            >
              <Minus size={18} />
            </button>

            <button
              className="icon-btn"
              title="Maximize"
            >
              <Maximize2 size={17} />
            </button>

            <button
              className="icon-btn"
              onClick={onClose}
              title="Close"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="compose-fields">
          <div className="compose-input-row">
            <span>To</span>

            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@company.com"
            />

            <button
              type="button"
              onClick={() => setShowCc(!showCc)}
            >
              CC
            </button>
          </div>

          {showCc && (
            <div className="compose-input-row">
              <span>CC</span>

              <input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@company.com"
              />
            </div>
          )}

          <div className="compose-input-row">
            <span>Subject</span>

            <input
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              placeholder="Subject"
            />
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your message..."
          />
        </div>

        <div className="compose-footer">
          <button
            className="secondary-btn"
            onClick={handleSave}
          >
            Save draft
          </button>

          <button
            className="icon-btn"
            title="Attach file"
          >
            <Paperclip size={19} />
          </button>

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={sending}
          >
            <Send size={17} />

            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}