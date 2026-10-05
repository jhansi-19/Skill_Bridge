'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import styles from '../dashboard/layout.module.css';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setData(data));
  }, []);

  if (!data) {
    return (
      <>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      </>
    );
  }

  const { analytics } = data;
  const stats = [
    { label: 'Total Users', value: analytics.totalUsers },
    { label: 'Students', value: analytics.totalStudents },
    { label: 'Clients', value: analytics.totalClients },
    { label: 'Projects', value: analytics.totalProjects },
    { label: 'Open Projects', value: analytics.openProjects },
    { label: 'Escrow Volume', value: `$${analytics.escrowVolume?.toLocaleString()}` },
    { label: 'Pending Reports', value: analytics.pendingReports },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>Platform Analytics</h1>
      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      <Card>
        <h3 style={{ marginBottom: '1rem' }}>Recent Users</h3>
        {data.recentUsers?.map((u) => (
          <div key={u._id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
            {u.name} — {u.email} — <span style={{ color: 'var(--accent)' }}>{u.role}</span>
          </div>
        ))}
      </Card>
    </>
  );
}
