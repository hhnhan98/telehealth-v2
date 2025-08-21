import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children, defaultPosition = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef({});

  const removeById = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
  }, []);

  const show = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    setToasts((prev) => {
      const next = [...prev, { id, message, type, duration }];
      // giới hạn số lượng toast hiển thị
      if (next.length > maxToasts) next.shift();
      return next;
    });

    // auto dismiss
    timeoutsRef.current[id] = setTimeout(() => removeById(id), duration);
    return id;
  }, [maxToasts, removeById]);

  const success = useCallback((message, duration = 3000) => show(message, { type: 'success', duration }), [show]);
  const error   = useCallback((message, duration = 3000) => show(message, { type: 'error',   duration }), [show]);
  const info    = useCallback((message, duration = 3000) => show(message, { type: 'info',    duration }), [show]);
  const warning = useCallback((message, duration = 3000) => show(message, { type: 'warning', duration }), [show]);

  const value = useMemo(() => ({
    show, success, error, info, warning, dismiss: removeById, dismissAll: clearAll, position: defaultPosition
  }), [show, success, error, info, warning, removeById, clearAll, defaultPosition]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onDismiss={removeById} position={defaultPosition} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};
