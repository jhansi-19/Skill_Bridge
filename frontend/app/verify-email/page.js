'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import styles from '../(auth)/auth.module.css';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <p className={styles.subtitle}>
      {status === 'verifying' && 'Verifying your email...'}
      {status === 'success' && 'Email verified! You can now use all features.'}
      {status === 'error' && 'Verification failed or link expired.'}
      {status === 'invalid' && 'Invalid verification link.'}
    </p>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Email Verification</h1>
        <Suspense fallback={<p className={styles.subtitle}>Loading...</p>}>
          <VerifyContent />
        </Suspense>
        <p className={styles.footer}><Link href="/login">Go to login</Link></p>
      </div>
    </div>
  );
}
