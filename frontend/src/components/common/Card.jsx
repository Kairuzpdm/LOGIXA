import React from 'react';
import styles from '../../styles/common/Card.module.css';

const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  className = '', 
  onClick,
  glow = false,
  style = {}
}) => {
  return (
    <div 
      className={`glass-panel ${styles.card} ${className}`} 
      onClick={onClick}
      style={{
        ...style,
        cursor: onClick ? 'pointer' : 'default',
        borderColor: glow ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255, 255, 255, 0.07)',
        boxShadow: glow ? '0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 242, 254, 0.1)' : '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
      }}
    >
      {(title || subtitle || actions) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
};

export default Card;
