'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from '../(auth)/auth.module.css';

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      addToast('Check your email for reset link', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>
          {sent ? 'If your email exists, we sent a reset link.' : 'Enter your email to receive a reset link'}
        </p>
        {!sent && (
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <Input label="Email" type="email" {...register('email', { required: true })} />
            <Button type="submit" full disabled={loading}>Send Reset Link</Button>
          </form>
        )}
        <p className={styles.footer}><Link href="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
