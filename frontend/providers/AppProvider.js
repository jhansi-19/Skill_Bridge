'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getSocket } from '@/lib/socket';
import { ThemeProvider } from './ThemeProvider';

export function AppProvider({ children }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = getSocket(token);
    socket?.on('notification', (notification) => {
      addNotification(notification);
    });

    return () => {
      socket?.off('notification');
    };
  }, [isAuthenticated, addNotification]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
