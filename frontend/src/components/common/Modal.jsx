import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from '../../styles/common/Modal.module.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = styles[size] || styles.md;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.dialog} ${sizeClass} glass-panel`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className={styles.body}>
          {children}
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
