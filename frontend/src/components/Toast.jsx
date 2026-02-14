import React, { useEffect } from 'react';

const Toast = ({ message = '', type = 'info', onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 2200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`app-toast ${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default Toast;
