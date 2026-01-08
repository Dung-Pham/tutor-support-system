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
    if (conversationId && conversations.length > 0) {
      // Always try to select conversation from URL (case-insensitive match)
      const conversation = conversations.find(
        (c) => c.id.toLowerCase() === conversationId.toLowerCase()
      );
      if (conversation) {
        // Only update if different from current active
        if (!activeConversation || activeConversation.id !== conversation.id) {
          dispatch(setActiveConversation(conversation));
        }
      } else {
        // Conversation not found, redirect to messages
        navigate('/student/messages', { replace: true });
      }
    }
  }, [conversationId, conversations, dispatch, navigate]);

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
      {/* Sidebar: Chat Sidebar - thu hẹp khi màn hình nhỏ */}
      <div
        className={`w-full md:w-52 lg:w-64 xl:w-72 md:min-w-[180px] border-r md:flex-shrink ${activeConversation ? 'hidden md:block' : 'block'}`}
      >
        <ChatSidebar conversations={conversations} loading={loading} />
      </div>

      {/* Main: Chat Box - ưu tiên giữ kích thước */}
      <div className={`flex-1 min-w-0 md:min-w-[350px] md:flex-shrink-0 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
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
