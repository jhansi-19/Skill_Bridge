'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useNotificationStore } from '@/store/notificationStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from '../projects/page.module.css';

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Notifications {unreadCount > 0 && `(${unreadCount})`}</h1>
          <Button variant="secondary" onClick={markAllAsRead}>Mark all read</Button>
        </div>
        {notifications.length === 0 ? (
          <p className={styles.empty}>No notifications yet</p>
        ) : (
          notifications.map((n) => (
            <Card
              key={n._id}
              style={{
                marginBottom: '0.75rem',
                opacity: n.read ? 0.7 : 1,
                borderLeft: n.read ? undefined : '3px solid var(--accent)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{n.title}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    {n.message}
                  </p>
                  {n.link && (
                    <Link href={n.link} style={{ color: 'var(--accent)', fontSize: '0.8125rem' }}>
                      View →
                    </Link>
                  )}
                </div>
                {!n.read && (
                  <Button size="sm" variant="ghost" onClick={() => markAsRead(n._id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </ProtectedRoute>
  );
}
