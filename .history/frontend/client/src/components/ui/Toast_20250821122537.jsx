import React from 'react';
import { createPortal } from 'react-dom';
import '../../styles/toast.css';

const TYPE_CLASS = {
  success: 'toast--success',
  error: 'toast--error',
  info: 'toast--info',
  warning: 'toast--warning',
};

function getPositionClass(position) {
  switch (position) {
    case 'top-left': return 'toast-container top-left';
    case 'top-right': return 'toast-container top-right';
    case 'bottom-left': return 'toast-container bottom-left';
    case 'bottom-right': return 'toast-container bottom-right';
    case 'top-center': return 'toast-container top-center';
    case 'bottom-center': return 'toast-container bottom-center';
    default: return 'toast-container top-right';
  }
}

const Toast = ({ toasts, onDismiss, position = 'top-right' }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className={getPositionClass(position)} aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${TYPE_CLASS[t.type] || ''}`} role="status">
          <div className="toast__message">{t.message}</div>
          <button
            className="toast__close"
            aria-label="Đóng"
            onClick={() => onDismiss(t.id)}
            type="button"
          >
            &times;
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default Toast;
