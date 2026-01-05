import { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { addMessage } from '@/store/slices/messagesSlice';
import type { Conversation } from '@/types/conversation';
import type { FileAttachment } from '@/types/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image as ImageIcon, X, Video, Paperclip } from 'lucide-react';
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
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Send typing indicator with debounce
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (isTypingRef.current !== isTyping) {
        isTypingRef.current = isTyping;
        socketService.sendTyping(conversation.id, isTyping);
      }
    },
    [conversation.id]
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
        socketService.sendTyping(conversation.id, false);
      }
    };
  }, [conversation.id]);

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

  // Handle video selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video không được vượt quá 100MB');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setVideoPreview(preview);
    setSelectedVideo(file);
  };

  // Remove selected video
  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Handle file/document selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, 5);

    // Check file sizes (25MB max each)
    const validFiles = fileArray.filter((file) => {
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" vượt quá 25MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    // Must have content or images or video or files
    if (
      !message.trim() &&
      selectedImages.length === 0 &&
      !selectedVideo &&
      selectedFiles.length === 0
    )
      return;

    // Lấy recipientId từ conversation participants (người còn lại không phải current user)
    const currentUserId = currentUser?.id;

    // Tìm participant khác với current user
    const otherParticipant = conversation.participants.find((p: { id: string }) => p.id !== currentUserId);

    if (!otherParticipant) {
      console.error('Cannot find other participant', { conversation, currentUserId });
      return;
    }

    const recipientId = otherParticipant.id;

    try {
      setSending(true);

      // Stop typing indicator when sending
      sendTypingIndicator(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const hasText = message.trim().length > 0;
      const hasImages = selectedImages.length > 0;
      const hasVideo = selectedVideo !== null;

      // 1. Gửi text trước (nếu có)
      if (hasText) {
        const newMessage = await messageService.sendMessage({
          conversationId: conversation.id,
          recipientId,
          content: message,
        });

        dispatch(addMessage(newMessage));

        // Clear text ngay sau khi gửi
        setMessage('');
      }

      // 2. Gửi video (nếu có)
      if (hasVideo && selectedVideo) {
        setUploading(true);

        try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('video', selectedVideo);

          // Upload video qua backend
          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload-cloudinary/video?type=chat`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 100)
                );
                console.log(`Video upload progress: ${percent}%`);
              },
            }
          );

          const videoUrl = uploadResponse.data.data.url;

          // Send message với video URL
          const newVideoMessage = await messageService.sendMessage({
            conversationId: conversation.id,
            recipientId,
            content: '',
            videoUrl,
          });

          dispatch(addMessage(newVideoMessage));
        } catch (uploadError) {
          console.error('Failed to upload video:', uploadError);
        } finally {
          setUploading(false);
        }

        // Clear video
        removeVideo();
      }

      // 3. Gửi ảnh sau (nếu có)
      if (hasImages) {
        setUploading(true);

        try {
          const token = localStorage.getItem('token');

          // Step 1: Get signature from backend
          const signResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload-cloudinary/signature`,
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
          const newImageMessage = await messageService.sendMessage({
            conversationId: conversation.id,
            recipientId,
            content: '', // Empty content for image-only message
            imgUrls,
          });

          dispatch(addMessage(newImageMessage));
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

      // 4. Gửi files/tài liệu (nếu có)
      const hasFiles = selectedFiles.length > 0;
      if (hasFiles) {
        setUploading(true);

        try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          selectedFiles.forEach((file) => {
            formData.append('files', file);
          });

          // Upload files qua backend
          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload/files?type=chat`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 100)
                );
                console.log(`File upload progress: ${percent}%`);
              },
            }
          );

          const fileUrls: FileAttachment[] = uploadResponse.data.data.map(
            (f: { url: string; fileName: string; fileSize: number; mimeType: string }) => ({
              url: f.url,
              fileName: f.fileName,
              fileSize: f.fileSize,
              mimeType: f.mimeType,
            })
          );

          // Send message với file URLs
          const newFileMessage = await messageService.sendMessage({
            conversationId: conversation.id,
            recipientId,
            content: '',
            fileUrls,
          });

          dispatch(addMessage(newFileMessage));
        } catch (uploadError) {
          console.error('Failed to upload files:', uploadError);
        } finally {
          setUploading(false);
        }

        // Clear files
        setSelectedFiles([]);
        if (docInputRef.current) {
          docInputRef.current.value = '';
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

      {/* Video Preview */}
      {videoPreview && (
        <div className="p-3 bg-background/50">
          <div className="relative inline-block">
            <video
              src={videoPreview}
              className="h-32 max-w-xs rounded-lg border object-cover"
              style={{ borderColor: 'hsl(var(--border))' }}
              controls
            />
            <button
              onClick={removeVideo}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* File Previews - Simple text list */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border-t">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="hover:text-destructive ml-1"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          disabled={sending || uploading}
          className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-gray-50 border-gray-200 rounded-full px-4 focus:bg-white focus:border-blue-400 focus:ring-blue-100 transition-colors"
        />

        {/* Hidden file input for images */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          disabled={sending || uploading}
        />

        {/* Hidden file input for video */}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="hidden"
          disabled={sending || uploading}
        />

        {/* Hidden file input for documents */}
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
          multiple
          onChange={handleFileSelect}
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
          title="Gửi ảnh"
        >
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
        </Button>

        {/* Video Upload Button */}
        <Button
          onClick={() => videoInputRef.current?.click()}
          disabled={sending || uploading || selectedVideo !== null}
          size="icon"
          variant="ghost"
          className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          type="button"
          title="Gửi video (tối đa 100MB)"
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
        </Button>

        {/* File Upload Button */}
        <Button
          onClick={() => docInputRef.current?.click()}
          disabled={sending || uploading || selectedFiles.length >= 5}
          size="icon"
          variant="ghost"
          className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          type="button"
          title="Gửi tài liệu (PDF, DOC, XLS... tối đa 25MB)"
        >
          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={
            (!message.trim() &&
              selectedImages.length === 0 &&
              !selectedVideo &&
              selectedFiles.length === 0) ||
            sending ||
            uploading
          }
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
