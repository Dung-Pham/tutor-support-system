/**
 * File: pages/student/StudentMessages.tsx
 * Mục đích: Trang nhắn tin chính
 * Layout: ChatSidebar (left) + ChatBox (right)
 */

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { setConversations, setLoading } from '@/store/slices/messagesSlice';
import * as conversationService from '@/services/conversationService';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatBox } from '@/components/chat/ChatBox';

export function StudentMessages() {
  const dispatch = useDispatch();
  const { conversations, activeConversation, loading } = useSelector(
    (state: RootState) => state.messages
  );

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      dispatch(setLoading(true));
      const response = await conversationService.getConversations();
      dispatch(setConversations(response.data || []));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar: Chat Sidebar */}
      <div className="w-80 border-r" style={{ borderColor: 'hsl(var(--border))' }}>
        <ChatSidebar conversations={conversations} loading={loading} />
      </div>

      {/* Main: Chat Box */}
      <div className="flex-1 min-w-0">
        {activeConversation ? (
          <ChatBox conversation={activeConversation} />
        ) : (
          <div
            className="flex items-center justify-center h-full text-center"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <div>
              <p className="text-lg font-semibold mb-2">Chọn cuộc trò chuyện</p>
              <p className="text-sm">Bắt đầu nhắn tin hoặc tạo cuộc trò chuyện mới</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentMessages;
