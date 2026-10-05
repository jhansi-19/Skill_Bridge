import styles from './Skeleton.module.css';

export default function Skeleton({ variant = 'text', className = '' }) {
  return <div className={`${styles.skeleton} ${styles[variant]} ${className}`} />;
}
