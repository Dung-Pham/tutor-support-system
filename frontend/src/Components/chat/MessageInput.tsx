import { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Conversation } from '@/types';
import { addMessage } from '@/store/slices/messagesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import * as messageService from '@/services/messageService';
import { EmojiPicker } from './EmojiPicker';
import socketService from '@/services/socketService';
import axios from 'axios';

interface MessageInputProps {
  conversation: Conversation;
}

export function MessageInput({ conversation }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Send typing indicator with debounce
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (isTypingRef.current !== isTyping) {
        isTypingRef.current = isTyping;
        socketService.sendTyping(conversation._id, isTyping);
      }
    },
    [conversation._id]
  );

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Send typing = true
    sendTypingIndicator(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing = false after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Make sure to send typing = false when leaving
      if (isTypingRef.current) {
        socketService.sendTyping(conversation._id, false);
      }
    };
  }, [conversation._id]);

  // Resize image before upload
  const resizeImage = (file: File, maxWidth = 1920, maxHeight = 1080): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Maximum 10 images
    const fileArray = Array.from(files).slice(0, 10);

    // ⚡ Create previews NGAY LẬP TỨC (Optimistic UI - giống Facebook)
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Resize images trong background (không block UI)
    const resizedFiles = await Promise.all(fileArray.map((file) => resizeImage(file)));
    setSelectedImages(resizedFiles);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke old preview URL
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSend = async () => {
    // Must have content or images
    if (!message.trim() && selectedImages.length === 0) return;

    // Lấy recipientId từ conversation participants (người còn lại không phải current user)
    const currentUserId = currentUser?.id || (currentUser as any)?._id;

    // Tìm participant khác với current user
    const otherParticipant = conversation.participants.find((p) => {
      const participantId = (p as any).id || p.userId;
      return participantId !== currentUserId;
    });

    if (!otherParticipant) {
      console.error('Cannot find other participant', { conversation, currentUserId });
      return;
    }

    const recipientId = (otherParticipant as any).id || otherParticipant.userId;

    try {
      setSending(true);

      // Stop typing indicator when sending
      sendTypingIndicator(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const hasText = message.trim().length > 0;
      const hasImages = selectedImages.length > 0;

      // 1. Gửi text trước (nếu có)
      if (hasText) {
        const textResponse = await messageService.sendMessage({
          conversationId: conversation._id,
          recipientId,
          content: message,
        });

        if (textResponse.data.message) {
          dispatch(addMessage(textResponse.data.message));
        }

        // Clear text ngay sau khi gửi
        setMessage('');
      }

      // 2. Gửi ảnh sau (nếu có)
      if (hasImages) {
        setUploading(true);

        try {
          const token = localStorage.getItem('token');

          // Step 1: Get signature from backend
          const signResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload/signature`,
            { type: 'chat' },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const { signature, timestamp, api_key, cloud_name, folder } = signResponse.data.data;

          // Step 2: Upload directly to Cloudinary
          const uploadPromises = selectedImages.map(async (image) => {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('api_key', api_key);
            formData.append('folder', folder);

            const uploadResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
              formData,
              {
                onUploadProgress: (progressEvent) => {
                  const percent = Math.round(
                    (progressEvent.loaded * 100) / (progressEvent.total || 100)
                  );
                  console.log(`Upload progress: ${percent}%`);
                },
              }
            );

            return uploadResponse.data.secure_url;
          });

          const imgUrls = await Promise.all(uploadPromises);

          // Step 3: Send message chỉ có ảnh, không có text
          const imageResponse = await messageService.sendMessage({
            conversationId: conversation._id,
            recipientId,
            content: '', // Empty content for image-only message
            imgUrls,
          });

          if (imageResponse.data.message) {
            dispatch(addMessage(imageResponse.data.message));
          }
        } catch (uploadError) {
          console.error('Failed to upload images:', uploadError);
        } finally {
          setUploading(false);
        }

        // Clear images
        setSelectedImages([]);
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }}>
      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-background/50">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg border"
                style={{ borderColor: 'hsl(var(--border))' }}
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 md:p-4">
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          disabled={sending || uploading}
          className="flex-1 h-9 sm:h-10 md:h-11 text-sm sm:text-base bg-secondary/50 border-secondary"
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          disabled={sending || uploading}
        />

        {/* Emoji Picker */}
        <EmojiPicker
          onEmojiSelect={(emoji) => setMessage(message + emoji)}
          disabled={sending || uploading}
        />

        {/* Image Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading || selectedImages.length >= 10}
          size="icon"
          variant="ghost"
          className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          type="button"
        >
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && selectedImages.length === 0) || sending || uploading}
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 bg-primary hover:bg-primary/90"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
