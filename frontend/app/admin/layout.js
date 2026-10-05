'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import styles from '../dashboard/layout.module.css';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute roles={['admin']}>
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.main}>{children}</div>
      </div>
    </ProtectedRoute>
  );
}
