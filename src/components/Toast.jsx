import React from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "info", onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle size={18} color="#10b981" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    info: <Info size={18} color="#f59e0b" />
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        {icons[type]}
        <span>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
