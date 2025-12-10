/**
 * File: pages/tutor/TutorMessages.tsx
 * Mục đích: Trang nhắn tin cho tutor (tương tự student)
 */

import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatBox } from '@/components/chat/ChatBox';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function TutorMessages() {
  const { conversations, activeConversation } = useSelector((state: RootState) => state.messages);

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar: Chat Sidebar */}
      <div className="w-80 border-r" style={{ borderColor: 'hsl(var(--border))' }}>
        <ChatSidebar conversations={conversations} />
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

export default TutorMessages;
