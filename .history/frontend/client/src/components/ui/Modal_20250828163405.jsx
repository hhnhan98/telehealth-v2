// src/components/ui/Modal.jsx
import React, { useEffect } from 'react';

const Modal = ({ title, children, onClose, isOpen, size = 'medium' }) => {
  // Hook: đóng modal khi nhấn ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Responsive size
  const maxWidthMap = {
    small: 400,
    medium: 600,
    large: 800,
    full: '95%',
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
          transition: 'opacity 0.3s',
        }}
        onClick={onClose}
      />

      {/* Modal box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          backgroundColor: '#fff',
          padding: 25,
          borderRadius: 12,
          maxWidth: maxWidthMap[size] || 600,
          width: '50%',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          transition: 'all 0.3s ease-in-out',
        }}
        onClick={(e) => e.stopPropagation()} // prevent overlay click
      >
        {/* Header */}
        <div style={{
          marginBottom: 15,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 1002,
          paddingBottom: 10,
          borderBottom: '1px solid #ddd'
        }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 24,
              cursor: 'pointer',
              color: '#555',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#000'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ paddingTop: 10 }}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
