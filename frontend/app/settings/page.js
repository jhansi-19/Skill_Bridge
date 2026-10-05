'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from '../projects/page.module.css';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { register, handleSubmit, defaultValues } = useForm({
    defaultValues: {
      name: user?.name,
      username: user?.username,
      bio: user?.bio,
      companyName: user?.companyName,
      companyWebsite: user?.companyWebsite,
    },
  });
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const skills = data.skills?.split(',').map((s) => s.trim()).filter(Boolean);
      const { data: res } = await api.patch('/users/profile', { ...data, skills });
      updateUser(res.user);
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
      addToast('Avatar updated', 'success');
    } catch {
      addToast('Upload failed', 'error');
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <h1 className={styles.title}>Settings</h1>
        <Card style={{ maxWidth: 600 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Profile Photo</label>
            <input type="file" accept="image/*" onChange={uploadAvatar} style={{ marginTop: '0.5rem' }} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Name" {...register('name')} />
            <Input label="Username" {...register('username')} />
            <Input label="Bio" textarea {...register('bio')} />
            {user?.role === 'student' && (
              <>
                <Input label="Hourly Rate ($/hr)" type="number" {...register('hourlyRate')} />
                <Input label="Skills (comma separated)" {...register('skills')} />
              </>
            )}
            {user?.role === 'client' && (
              <>
                <Input label="Company Name" {...register('companyName')} />
                <Input label="Website" {...register('companyWebsite')} />
              </>
            )}
            <Button type="submit" disabled={loading}>Save Profile Changes</Button>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
