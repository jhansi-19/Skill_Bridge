import { create } from 'zustand';

export const useChatStore = create((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  typingUsers: {},
  onlineUsers: {},

  setConversations: (conversations) => set({ conversations }),
  upsertConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.some((c) => c._id === conversation._id);
      return {
        conversations: exists ? state.conversations : [conversation, ...state.conversations],
      };
    }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      const messageId = message?._id?.toString?.() || message?._id;
      if (!messageId) return state;
      const exists = state.messages.some(
        (m) => (m._id?.toString?.() || m._id) === messageId
      );
      if (exists) return state;
      return { messages: [...state.messages, message] };
    }),
  setTyping: (conversationId, userId, isTyping) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: isTyping ? userId : null,
      },
    })),
  setOnline: (userId, online) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: online },
    })),
}));
