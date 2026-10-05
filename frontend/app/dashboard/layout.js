'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className={styles.layout}>
        <Sidebar mobileOpen={mobileOpen} />
        <div className={styles.main}>{children}</div>
      </div>
    </ProtectedRoute>
  );
}
