'use client';

import styles from './Input.module.css';

export default function Input({
  label,
  error,
  textarea,
  className = '',
  ...props
}) {
  const InputEl = textarea ? 'textarea' : 'input';
  return (
    <div className={`${styles.group} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <InputEl
        className={`${styles.input} ${textarea ? styles.textarea : ''} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
