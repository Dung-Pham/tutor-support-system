import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import {
  addMessage,
  setTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from '@/store/slices/messagesSlice';
import socketService from '@/services/socketService';
import type { Message } from '@/types';

export function SocketInitializer() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    if (token && isAuthenticated) {
      socketService.connect(token).catch((error) => {
        console.error('Failed to connect socket:', error);
      });
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      if (data.message.senderId !== currentUserId) {
        dispatch(addMessage(data.message));
      }
    };

    const handleUserTyping = (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => {
      if (data.userId !== currentUserId) {
        if (data.isTyping) {
          dispatch(setTyping({ conversationId: data.conversationId, users: [data.userId] }));
        } else {
          dispatch(setTyping(null));
        }
      }
    };

    const handleOnlineUsers = (data: { users: string[] }) => {
      dispatch(setOnlineUsers(data.users));
    };

    const handleUserOnline = (data: { userId: string }) => {
      dispatch(addOnlineUser(data.userId));
    };

    const handleUserOffline = (data: { userId: string }) => {
      dispatch(removeOnlineUser(data.userId));
    };

    const unsubscribeMessage = socketService.on('new_message', handleNewMessage);
    const unsubscribeTyping = socketService.on('user_typing', handleUserTyping);
    const unsubscribeOnlineUsers = socketService.on('online_users', handleOnlineUsers);
    const unsubscribeUserOnline = socketService.on('user_online', handleUserOnline);
    const unsubscribeUserOffline = socketService.on('user_offline', handleUserOffline);

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeOnlineUsers();
      unsubscribeUserOnline();
      unsubscribeUserOffline();
    };
  }, [dispatch, currentUserId, isAuthenticated]);

  return null;
}

export default SocketInitializer;
