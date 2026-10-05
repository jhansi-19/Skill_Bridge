'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToastStore } from '@/store/toastStore';
import styles from '../../dashboard/layout.module.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const addToast = useToastStore((s) => s.addToast);

  const load = () => api.get('/admin/users').then(({ data }) => setUsers(data.users));
  useEffect(() => { load(); }, []);

  const toggleBan = async (id, isBanned) => {
    try {
      await api.patch(`/admin/users/${id}/ban`, { isBanned: !isBanned });
      addToast(isBanned ? 'User unbanned' : 'User banned', 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <>
      <h1 className={styles.pageTitle}>User Management</h1>
      {users.map((u) => (
        <Card key={u._id} style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{u.name}</strong> — {u.email}
              <span style={{ marginLeft: 8, color: 'var(--accent)' }}>{u.role}</span>
              {u.isBanned && <span style={{ color: 'var(--error)', marginLeft: 8 }}>BANNED</span>}
            </div>
            <Button
              variant={u.isBanned ? 'secondary' : 'danger'}
              size="sm"
              onClick={() => toggleBan(u._id, u.isBanned)}
            >
              {u.isBanned ? 'Unban' : 'Ban'}
            </Button>
          </div>
        </Card>
      ))}
    </>
  );
}
