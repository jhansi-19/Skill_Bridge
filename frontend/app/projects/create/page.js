'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToastStore } from '@/store/toastStore';
import styles from '../page.module.css';

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'video-editing', label: 'Video Editing' },
  { value: 'other', label: 'Other' },
];

export default function CreateProjectPage() {
  const { register, handleSubmit } = useForm({
    defaultValues: { category: 'web-development' },
  });
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const skills = data.skills?.split(',').map((s) => s.trim()).filter(Boolean) || [];
      const payload = {
        title: data.title,
        description: data.description,
        budget: parseFloat(data.budget),
        category: data.category || 'other',
        skillsRequired: skills,
        status: 'open',
      };
      if (data.deadline) payload.deadline = data.deadline;

      const { data: res } = await api.post('/projects', payload);
      addToast('Project published!', 'success');
      router.push(`/projects/${res.project._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={['client', 'admin']}>
      <div className={styles.page}>
        <h1 className={styles.title}>Post a Project</h1>
        <Card style={{ maxWidth: 640 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Title" {...register('title', { required: true })} />
            <Input label="Description" textarea {...register('description', { required: true })} />
            <Input label="Budget ($)" type="number" {...register('budget', { required: true })} />
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              Category
              <select
                {...register('category')}
                style={{
                  padding: '0.625rem 1rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <Input label="Skills (comma separated)" {...register('skills')} />
            <Input label="Deadline" type="date" {...register('deadline')} />
            <Button type="submit" disabled={loading}>{loading ? 'Publishing...' : 'Publish Project'}</Button>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
