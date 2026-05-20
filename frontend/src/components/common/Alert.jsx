import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import styles from '../../styles/common/Alert.module.css';

const Alert = ({ 
  type = 'info', 
  message, 
  onClose,
  className = '' 
}) => {
  if (!message) return null;

  const config = {
    success: {
      icon: CheckCircle
    },
    error: {
      icon: XCircle
    },
    warning: {
      icon: AlertCircle
    },
    info: {
      icon: Info
    }
  };

  const Icon = config[type]?.icon || Info;

  return (
    <div className={`${styles.alert} ${styles[type] || styles.info} ${className}`.trim()}>
      <div className={styles.content}>
        <Icon size={18} className={styles.icon} />
        <span className={styles.message}>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className={styles.closeButton}
          type="button"
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
