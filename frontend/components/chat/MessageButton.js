'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useToastStore } from '@/store/toastStore';
import { getOrCreateConversation } from '@/lib/chat';
import { normalizeId } from '@/lib/ids';
import Button from '@/components/ui/Button';

export default function MessageButton({
  recipientId,
  projectId,
  label = 'Message',
  size = 'sm',
  variant = 'secondary',
  full,
  style,
}) {
  const user = useAuthStore((s) => s.user);
  const upsertConversation = useChatStore((s) => s.upsertConversation);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const id = normalizeId(recipientId);
  const normalizedProjectId = normalizeId(projectId);

  if (!user || !id || user._id?.toString() === id) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      const conversation = await getOrCreateConversation(id, normalizedProjectId);
      upsertConversation(conversation);
      setActiveConversation(conversation);
      router.push('/messages');
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not start conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      full={full}
      style={style}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? 'Opening...' : label}
    </Button>
  );
}
