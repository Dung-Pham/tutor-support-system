import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatBox } from '@/components/chat/ChatBox';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { RootState } from '@/store';
import { setConversations, setLoading, setActiveConversation } from '@/store/slices/messagesSlice';
import * as conversationService from '@/services/conversationService';

export function TutorMessages() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { conversations, activeConversation, loading } = useSelector(
    (state: RootState) => state.messages
  );

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-select conversation from URL when conversations are loaded
  useEffect(() => {
    if (conversationId && conversations.length > 0 && !activeConversation) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        dispatch(setActiveConversation(conversation));
      } else {
        // Conversation not found, redirect to messages
        navigate('/tutor/messages', { replace: true });
      }
    }
  }, [conversationId, conversations, activeConversation, dispatch, navigate]);

  // Clear active conversation when navigating away
  useEffect(() => {
    return () => {
      // Don't clear if just changing conversation
    };
  }, []);

  const fetchConversations = async () => {
    try {
      dispatch(setLoading(true));
      const conversations = await conversationService.getConversations();
      dispatch(setConversations(conversations));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-full gap-0 md:gap-4">
      {/* Sidebar: Chat Sidebar - thu hẹp khi màn hình nhỏ */}
      <div
        className={`w-full md:w-52 lg:w-64 xl:w-80 md:min-w-[180px] border-r md:flex-shrink ${activeConversation ? 'hidden md:block' : 'block'}`}
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <ChatSidebar conversations={conversations} loading={loading} />
      </div>

      {/* Main: Chat Box - ưu tiên giữ kích thước */}
      <div className={`flex-1 min-w-0 md:min-w-[350px] md:flex-shrink-0 w-full ${!activeConversation ? 'hidden md:block' : 'block'}`}>
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
