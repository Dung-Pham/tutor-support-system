import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatBox } from '@/components/chat/ChatBox';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState } from '@/store';
import { setConversations, setLoading } from '@/store/slices/messagesSlice';
import * as conversationService from '@/services/conversationService';

export function TutorMessages() {
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
      dispatch(setConversations(response.data.conversations || []));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-full gap-0 md:gap-4">
      {/* Sidebar: Chat Sidebar - Ẩn khi có active conversation trên mobile */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r ${activeConversation ? 'hidden md:block' : 'block'}`}
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <ChatSidebar conversations={conversations} loading={loading} />
      </div>

      {/* Main: Chat Box - Full screen trên mobile */}
      <div className={`flex-1 min-w-0 w-full ${!activeConversation ? 'hidden md:block' : 'block'}`}>
        {activeConversation ? (
          <ChatBox conversation={activeConversation} />
        ) : (
          <div
            className="flex items-center justify-center h-full text-center px-4"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <div>
              <p className="text-base sm:text-lg font-semibold mb-2">Chọn cuộc trò chuyện</p>
              <p className="text-sm">Bắt đầu nhắn tin hoặc tạo cuộc trò chuyện mới</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorMessages;
