'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from '../(auth)/auth.module.css';

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const signup = useAuthStore((s) => s.signup);
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup({ ...data, role });
      addToast('Account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Join SkillBridge</h1>
        <p className={styles.subtitle}>Create your account and start your journey</p>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.roleSelect}>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'student' ? styles.roleActive : ''}`}
              onClick={() => setRole('student')}
            >
              I&apos;m a Student
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'client' ? styles.roleActive : ''}`}
              onClick={() => setRole('client')}
            >
              I&apos;m a Client
            </button>
          </div>
          <Input label="Full Name" error={errors.name?.message} {...register('name', { required: 'Name required' })} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email required' })} />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          <Button type="submit" full disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
        <p className={styles.footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
