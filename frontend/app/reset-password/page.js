'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from '../(auth)/auth.module.css';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { register, handleSubmit } = useForm();
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      addToast('Password reset successfully', 'success');
      router.push('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <p className={styles.subtitle}>Invalid reset link.</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Input label="New Password" type="password" {...register('password', { required: true, minLength: 6 })} />
      <Button type="submit" full disabled={loading}>Reset Password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>New password</h1>
        <Suspense fallback={<p>Loading...</p>}>
          <ResetForm />
        </Suspense>
        <p className={styles.footer}><Link href="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
