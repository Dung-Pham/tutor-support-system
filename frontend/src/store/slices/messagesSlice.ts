import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message } from '@/types';

interface TypingState {
  conversationId: string;
  users: string[];
}

interface MessagesState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>; // { conversationId: [messages] }
  typing: TypingState | null;
  onlineUsers: string[]; // List of online user IDs
  unreadCounts: Record<string, number>; // { conversationId: count }
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  typing: null,
  onlineUsers: [],
  unreadCounts: {},
  loading: false,
  error: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Conversations
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },

    addConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
    },

    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
      if (action.payload) {
        // Reset unread count khi mở conversation
        state.unreadCounts[action.payload.id] = 0;
      }
    },

    // Messages
    setMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const { conversationId } = message;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Check duplicate - tránh thêm message trùng từ API + Socket
      const exists = state.messages[conversationId].some((m) => m._id === message._id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }

      // Update last message trong conversation list
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = {
          _id: message._id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        };
        conv.lastMessageAt = message.createdAt;
      }
    },

    // Note: updateMessageStatus removed - backend không có status field
    // WebSocket real-time updates sẽ handle delivery status nếu cần sau này

    // Typing
    setTyping: (state, action: PayloadAction<TypingState | null>) => {
      state.typing = action.payload;
    },

    // Online users
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },

    addOnlineUser: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },

    // Unread counts
    setUnreadCount: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },

    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
    },

    // Loading & Error
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset
    resetMessages: (state) => {
      state.messages = {};
      state.activeConversation = null;
      state.typing = null;
    },
  },
});

export const {
  setConversations,
  addConversation,
  setActiveConversation,
  setMessages,
  addMessage,
  setTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setUnreadCount,
  incrementUnreadCount,
  setLoading,
  setError,
  resetMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
