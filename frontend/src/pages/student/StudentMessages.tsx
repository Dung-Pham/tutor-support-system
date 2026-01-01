import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { RootState } from '@/store';
import { setConversations, setLoading, setActiveConversation } from '@/store/slices/messagesSlice';
import * as conversationService from '@/services/conversationService';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatBox } from '@/components/chat/ChatBox';

export function StudentMessages() {
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
        navigate('/student/messages', { replace: true });
      }
    }
  }, [conversationId, conversations, activeConversation, dispatch, navigate]);

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
    <div className="flex h-full gap-0 md:gap-3">
      {/* Sidebar: Chat Sidebar - nhỏ gọn để ưu tiên ChatBox */}
      <div
        className={`w-full md:w-64 lg:w-72 border-r flex-shrink-0 ${activeConversation ? 'hidden md:block' : 'block'}`}
      >
        <ChatSidebar conversations={conversations} loading={loading} />
      </div>

      {/* Main: Chat Box - chiếm toàn bộ không gian còn lại */}
      <div className={`flex-1 min-w-0 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <ChatBox conversation={activeConversation} />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-center px-4">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-2 text-foreground">Chọn cuộc trò chuyện</p>
              <p className="text-sm text-muted-foreground">
                Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentMessages;
