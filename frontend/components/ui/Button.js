'use client';

import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size,
  full,
  disabled,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    size && styles[size],
    full && styles.full,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
