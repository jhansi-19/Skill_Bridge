'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import { getOtherParticipant } from '@/lib/chat';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

function MessagesContent() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const {
    conversations,
    activeConversation,
    messages,
    setConversations,
    setActiveConversation,
    setMessages,
    addMessage,
    typingUsers,
    setTyping,
  } = useChatStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/messages/conversations');
        if (!cancelled) setConversations(data.conversations);
      } catch (err) {
        if (!cancelled) {
          setConversations([]);
          addToast(err.response?.data?.message || 'Could not load conversations', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [setConversations, addToast]);

  useEffect(() => {
    if (!activeConversation || !user) return;
    const token = localStorage.getItem('accessToken');
    const socket = getSocket(token);

    socket?.emit('join-conversation', activeConversation._id);

    api.get(`/messages/${activeConversation._id}`).then(({ data }) => {
      setMessages(data.messages);
    }).catch((err) => {
      addToast(err.response?.data?.message || 'Could not load messages', 'error');
    });

    socket?.on('receive-message', (msg) => {
      const conversationId = msg.conversation?._id || msg.conversation;
      if (conversationId !== activeConversation._id) return;

      const senderId = msg.sender?._id?.toString?.() || msg.sender?.toString?.();
      if (senderId === user?._id?.toString()) return;

      addMessage(msg);
    });

    socket?.on('typing', ({ conversationId }) => {
      if (conversationId === activeConversation._id) setTyping(conversationId, 'other', true);
    });

    socket?.on('stop-typing', ({ conversationId }) => {
      setTyping(conversationId, null, false);
    });

    return () => {
      socket?.off('receive-message');
      socket?.off('typing');
      socket?.off('stop-typing');
    };
  }, [activeConversation, user, setMessages, addMessage, setTyping, addToast]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conv) => {
    setActiveConversation(conv);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !activeConversation) return;

    const messageContent = content.trim();
    setContent('');

    try {
      const { data } = await api.post(`/messages/${activeConversation._id}`, { content: messageContent });
      addMessage(data.message);
    } catch (err) {
      setContent(messageContent);
      addToast(err.response?.data?.message || 'Failed to send message', 'error');
    }
  };

  const otherName = activeConversation
    ? getOtherParticipant(activeConversation, user?._id)?.name
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.list}>
        {loading ? (
          <div className={styles.listEmpty}>Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className={styles.listEmpty}>
            <p><strong>No conversations yet</strong></p>
            <p>Start chatting from:</p>
            <ul>
              <li>A <Link href="/projects">project page</Link> (message the client or a bidder)</li>
              <li>A <Link href="/freelancers">freelancer profile</Link></li>
              <li>After hiring someone on a project</li>
            </ul>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv, user?._id);
            return (
              <div
                key={conv._id}
                className={`${styles.listItem} ${activeConversation?._id === conv._id ? styles.active : ''}`}
                onClick={() => selectConversation(conv)}
              >
                <strong>{other?.name || 'Unknown'}</strong>
                {conv.project?.title && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 2 }}>
                    {conv.project.title}
                  </p>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {conv.lastMessage?.content?.slice(0, 40) || 'No messages yet'}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.chat}>
        {activeConversation ? (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
              <strong>{otherName || 'Chat'}</strong>
            </div>
            <div className={styles.messages}>
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`${styles.message} ${
                    msg.sender?._id === user?._id || msg.sender === user?._id
                      ? styles.sent
                      : styles.received
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>
            {typingUsers[activeConversation._id] && (
              <div className={styles.typing}>Typing...</div>
            )}
            <form className={styles.inputArea} onSubmit={sendMessage}>
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
              />
              <Button type="submit">Send</Button>
            </form>
          </>
        ) : (
          <div className={styles.empty}>
            {conversations.length > 0
              ? 'Select a conversation from the list'
              : 'Use the Message button on a project or freelancer profile to start chatting'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <div style={{ padding: '1rem' }}>
        <MessagesContent />
      </div>
    </ProtectedRoute>
  );
}
