'use client';

import { useToastStore } from '@/store/toastStore';
import styles from './Toast.module.css';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
