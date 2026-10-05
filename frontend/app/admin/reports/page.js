'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from '../../dashboard/layout.module.css';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get('/admin/reports').then(({ data }) => setReports(data.reports));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/reports/${id}`, { status });
    const { data } = await api.get('/admin/reports');
    setReports(data.reports);
  };

  return (
    <>
      <h1 className={styles.pageTitle}>Reports</h1>
      {reports.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No reports</p>
      ) : (
        reports.map((r) => (
          <Card key={r._id} style={{ marginBottom: '0.75rem' }}>
            <strong>{r.reason}</strong> — {r.status}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
              {r.description}
            </p>
            <p style={{ fontSize: '0.8125rem' }}>
              Reporter: {r.reporter?.name} | Reported: {r.reportedUser?.name}
            </p>
            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <Button size="sm" onClick={() => updateStatus(r._id, 'resolved')}>Resolve</Button>
                <Button size="sm" variant="ghost" onClick={() => updateStatus(r._id, 'dismissed')}>
                  Dismiss
                </Button>
              </div>
            )}
          </Card>
        ))
      )}
    </>
  );
}
