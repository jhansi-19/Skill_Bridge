'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Skeleton from '@/components/ui/Skeleton';

export default function ProtectedRoute({ children, roles }) {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if (!isLoading && isAuthenticated && roles && !roles.includes(user?.role)) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, roles, router]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Skeleton variant="title" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (roles && !roles.includes(user?.role)) return null;

  return children;
}
