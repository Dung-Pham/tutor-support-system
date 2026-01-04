import type { Message, User } from '@/types';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { Download, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import messageService from '@/services/messageService';
import { removeMessage } from '@/store/slices/messagesSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MessageBubbleProps {
  message: Message;
  showTime?: boolean;
}

// Download file with correct filename
const downloadFile = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};

// Get file icon based on mime type
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
  if (mimeType.includes('text')) return '📃';
  return '📎';
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function MessageBubble({ message, showTime = false }: MessageBubbleProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user) as User | null;
  const activeConversation = useSelector((state: RootState) => state.messages.activeConversation);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // So sánh senderId với currentUser id (có thể là user_id hoặc id)
  const currentUserId = currentUser?.user_id || currentUser?.id;
  const isOwn = currentUserId && message.senderId.toUpperCase() === currentUserId.toUpperCase();

  // Tìm thông tin người gửi từ participants
  const sender = activeConversation?.participants.find((p) => p.id === message.senderId);
  const senderName = sender?.name || 'Người dùng';
  const senderInitial = senderName.charAt(0).toUpperCase();
  const senderAvatar = sender?.avatarUrl;

  const handleDeleteMessage = async () => {
    if (!message._id) return;

    setIsDeleting(true);
    try {
      await messageService.deleteMessage(message._id);
      dispatch(removeMessage({ messageId: message._id, conversationId: message.conversationId }));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const messageTime = new Date(message.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div className={`group flex gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <div className="flex-shrink-0">
            {senderAvatar ? (
              <img
                src={senderAvatar}
                alt={senderName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                {senderInitial}
              </div>
            )}
          </div>
        )}

        {/* Delete button for own messages - show on left side */}
        {isOwn && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-muted transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xoá tin nhắn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div
          className={`flex flex-col gap-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${isOwn ? 'items-end' : 'items-start'}`}
        >
          {/* Display video if present */}
          {message.videoUrl && (
            <div className="rounded-lg overflow-hidden">
              <video
                src={message.videoUrl}
                controls
                className="w-full max-h-64 sm:max-h-72 md:max-h-80 rounded-lg"
                preload="metadata"
              />
            </div>
          )}

          {/* Display images if present - without background wrapper */}
          {message.imgUrls && message.imgUrls.length > 0 && (
            <div
              className={`grid gap-1 rounded-lg overflow-hidden ${
                message.imgUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {message.imgUrls.map((url, index) => {
                const totalImages = message.imgUrls?.length || 0;
                const isLastImage = index === totalImages - 1;
                const isOddCount = totalImages % 2 === 1;
                const shouldAlignRight = isOddCount && isLastImage && totalImages > 1;

                return (
                  <img
                    key={index}
                    src={url}
                    alt={`Image ${index + 1}`}
                    loading="lazy"
                    className={`w-full h-auto max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-72 object-cover rounded cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all duration-200 ${
                      shouldAlignRight ? 'col-start-2' : ''
                    }`}
                    onClick={() => window.open(url, '_blank')}
                  />
                );
              })}
            </div>
          )}

          {/* Display text content if present */}
          {message.content && (
            <div
              className="rounded-lg break-words px-3 py-2"
              style={{
                backgroundColor: isOwn ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                color: isOwn ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
              }}
            >
              <p className="text-base">{message.content}</p>
            </div>
          )}

          {/* Display file attachments if present */}
          {message.fileUrls && message.fileUrls.length > 0 && (
            <div className="flex flex-col gap-1">
              {message.fileUrls.map((file, index) => (
                <button
                  key={index}
                  onClick={() => downloadFile(file.url, file.fileName)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:opacity-80 transition-opacity cursor-pointer ${
                    isOwn ? 'bg-primary/90' : 'bg-muted'
                  }`}
                >
                  <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className={`text-sm font-medium truncate ${isOwn ? 'text-primary-foreground' : ''}`}
                    >
                      {file.fileName}
                    </p>
                    <p
                      className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                    >
                      {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                  <Download
                    className={`w-4 h-4 ${isOwn ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                  />
                </button>
              ))}
            </div>
          )}

          {showTime && (
            <span className="text-base font-medium text-muted-foreground block mt-3">
              {messageTime}
            </span>
          )}
        </div>

        {/* Delete button for other's messages - show on right side */}
        {!isOwn && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Placeholder for future features like reply */}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá tin nhắn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá tin nhắn này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xoá...' : 'Xoá'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
