import React from 'react';
import styles from '../../styles/common/Input.module.css';

const Input = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  name,
  disabled = false,
  error,
  required = false,
  options = [], // Para selects
  className = '',
  icon: Icon
}) => {
  const controlClassName = `${styles.control} ${error ? styles.controlError : ''} ${Icon ? styles.hasIcon : ''}`.trim();

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      {label && (
        <label className={styles.label}>
          <span>{label} {required && <span style={{ color: '#ff007f' }}>*</span>}</span>
        </label>
      )}
      <div className={styles.inputWrapper}>
        {Icon && <span className={styles.icon}><Icon size={16} /></span>}
        {type === 'select' ? (
          <select
            name={name}
            value={value}
            disabled={disabled}
            onChange={onChange}
            className={controlClassName}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className={styles.selectOption}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            disabled={disabled}
            onChange={onChange}
            placeholder={placeholder}
            className={`${controlClassName} ${styles.textarea}`.trim()}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            disabled={disabled}
            onChange={onChange}
            placeholder={placeholder}
            className={controlClassName}
          />
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;
