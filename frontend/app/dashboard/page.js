'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import styles from './layout.module.css';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/dashboard/stats').then(({ data }) => {
      setStats(data.stats);
      setLoading(false);
    }).catch(() => setLoading(false));
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return (
      <>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      </>
    );
  }

  const studentStats = [
    { label: 'Active Bids', value: stats?.activeBids ?? 0 },
    { label: 'Active Projects', value: stats?.activeProjects ?? 0 },
    { label: 'Earnings', value: `$${stats?.earnings ?? 0}` },
    { label: 'Completed', value: stats?.completedProjects ?? 0 },
  ];

  const clientStats = [
    { label: 'Posted Projects', value: stats?.postedProjects ?? 0 },
    { label: 'Open Projects', value: stats?.openProjects ?? 0 },
    { label: 'Pending Bids', value: stats?.pendingBids ?? 0 },
    { label: 'Hired', value: stats?.hiredCount ?? 0 },
  ];

  const displayStats = user?.role === 'client' ? clientStats : studentStats;

  return (
    <>
      <h1 className={styles.pageTitle}>Welcome, {user?.name?.split(' ')[0]}</h1>
      <div className={styles.grid}>
        {displayStats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      <Card style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Marketplace & Freelancer Hub</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {user?.role === 'client' ? (
            <>
              <Link href="/projects/create"><Button>Post a Project</Button></Link>
              <Link href="/projects?tab=workrooms"><Button variant="secondary">🔒 My Workrooms</Button></Link>
              <Link href="/gigs"><Button variant="secondary">Browse Student Gigs</Button></Link>
              <Link href="/freelancers"><Button variant="secondary">Find Talent</Button></Link>
            </>
          ) : (
            <>
              <Link href="/projects?tab=workrooms"><Button>🔒 My Workrooms</Button></Link>
              <Link href="/gigs/create"><Button variant="secondary">Publish a Service Gig</Button></Link>
              <Link href="/skills/assessment"><Button variant="secondary">Skill Badges</Button></Link>
              <Link href="/projects"><Button variant="secondary">Browse Open Projects</Button></Link>
            </>
          )}
          <Link href="/messages"><Button variant="ghost">Live Messages</Button></Link>
          <Link href="/notifications"><Button variant="ghost">Notifications</Button></Link>
          {user?.role === 'admin' && (
            <Link href="/admin/disputes"><Button variant="danger">Disputes Mediation</Button></Link>
          )}
        </div>
      </Card>
    </>
  );
}
