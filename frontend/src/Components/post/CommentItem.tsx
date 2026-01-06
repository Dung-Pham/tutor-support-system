import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, MoreHorizontal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { Comment, Reply } from '@/types/comment';
import { UserRole } from '@/types/user';
import { formatMessageTime } from '@/lib/utils';
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
import { CommentForm } from './CommentForm';
import {
  toggleCommentLikeAsync,
  toggleReplyLikeAsync,
  deleteCommentAsync,
  deleteReplyAsync,
  createReplyAsync,
  getRepliesAsync,
} from '@/store/slices/commentSlice';

// Helper function to render role badge
function RoleBadge({ role }: { role?: UserRole }) {
  if (!role) return null;

  const roleConfig = {
    tutor: { label: 'Gia sư', className: 'bg-blue-100 text-blue-700' },
    student: { label: 'Học sinh', className: 'bg-green-100 text-green-700' },
    admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
  };

  const config = roleConfig[role];
  if (!config) return null;

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  postAuthorId?: string;
}

export function CommentItem({ comment, postId, postAuthorId }: CommentItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { repliesByComment, loadingReplies } = useSelector((state: RootState) => state.comments);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount || 0);
  const [replyingTo, setReplyingTo] = useState<{ userId: string; displayName: string } | null>(
    null
  );

  const isAuthor = user?.id === comment.userId;
  const isPostAuthor = postAuthorId && comment.userId === postAuthorId;
  const replies = repliesByComment[comment.id] || [];
  const hasReplies = comment.replyCount > 0;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleLike = async () => {
    // Optimistic update
    setLocalLiked(!localLiked);
    setLocalLikeCount((prev: number) => (localLiked ? prev - 1 : prev + 1));

    try {
      const result = await dispatch(
        toggleCommentLikeAsync({ commentId: comment.id, postId })
      ).unwrap();
      // Sync with server response
      setLocalLikeCount(result.likeCount);
      setLocalLiked(result.liked);
    } catch {
      // Revert on error
      setLocalLiked(localLiked);
      setLocalLikeCount(comment.likeCount || 0);
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteCommentAsync({ commentId: comment.id, postId }));
    setDeleteOpen(false);
  };

  const handleReplySubmit = async (content: string) => {
    await dispatch(
      createReplyAsync({
        commentId: comment.id,
        postId,
        content,
        mentionedUserId: replyingTo?.userId,
      })
    ).unwrap();
    setShowReplyForm(false);
    setReplyingTo(null);
    setShowReplies(true);
  };

  const handleReplyToReply = (userId: string, displayName: string) => {
    setReplyingTo({ userId, displayName });
    setShowReplyForm(true);
    setShowReplies(true);
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0 && hasReplies) {
      await dispatch(getRepliesAsync({ commentId: comment.id, page: 1, limit: 10 }));
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className="group">
      {/* Main Comment */}
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={
            comment.user?.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`
          }
          alt={comment.user?.name || comment.user?.displayName || 'User'}
          className="w-9 h-9 rounded-full flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm text-gray-900">
                {comment.user?.name || comment.user?.displayName || 'Unknown User'}
              </span>
              {isPostAuthor && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-orange-100 text-orange-700">
                  Tác giả
                </span>
              )}
              <RoleBadge role={comment.user?.role} />
              <span className="text-xs text-gray-500">
                {formatMessageTime(new Date(comment.createdAt))}
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5 px-2">
            <button
              onClick={handleLike}
              className={`text-xs font-medium transition ${
                localLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Heart size={14} fill={localLiked ? 'currentColor' : 'none'} />
                {localLikeCount > 0 && <span>{localLikeCount}</span>}
              </span>
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Trả lời
            </button>

            {hasReplies && (
              <button
                onClick={handleToggleReplies}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1"
              >
                {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {comment.replyCount} trả lời
              </button>
            )}

            {/* More actions */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Xóa bình luận
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn chắc chắn muốn xóa bình luận này?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 pl-2">
              {replyingTo && (
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  Đang trả lời{' '}
                  <span className="font-semibold text-gray-700">@{replyingTo.displayName}</span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-gray-600 ml-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              <CommentForm
                onSubmit={handleReplySubmit}
                placeholder={
                  replyingTo
                    ? `Trả lời @${replyingTo.name || replyingTo.displayName}...`
                    : `Trả lời ${comment.user?.name || comment.user?.displayName || 'User'}...`
                }
                buttonText="Trả lời"
                autoFocus
                showCancel
                onCancel={handleCancelReply}
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-200">
              {loadingReplies[comment.id] ? (
                <div className="text-sm text-gray-500 py-2">Đang tải...</div>
              ) : (
                replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    commentId={comment.id}
                    currentUserId={user?.id}
                    postAuthorId={postAuthorId}
                    onReply={handleReplyToReply}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reply Item Component
interface ReplyItemProps {
  reply: Reply;
  commentId: string;
  currentUserId?: string;
  postAuthorId?: string;
  onReply: (userId: string, displayName: string) => void;
}

function ReplyItem({ reply, commentId, currentUserId, postAuthorId, onReply }: ReplyItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(reply.likeCount || 0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isAuthor = currentUserId === reply.userId;
  const isPostAuthor = postAuthorId && reply.userId === postAuthorId;

  const handleLike = async () => {
    setLocalLiked(!localLiked);
    setLocalLikeCount((prev: number) => (localLiked ? prev - 1 : prev + 1));

    try {
      const result = await dispatch(
        toggleReplyLikeAsync({ replyId: reply.id, commentId })
      ).unwrap();
      // Sync with server response
      setLocalLikeCount(result.likeCount);
      setLocalLiked(result.liked);
    } catch {
      setLocalLiked(localLiked);
      setLocalLikeCount(reply.likeCount || 0);
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteReplyAsync({ replyId: reply.id, commentId }));
    setDeleteOpen(false);
  };

  const handleReply = () => {
    onReply(reply.userId, reply.user?.displayName || 'User');
  };

  return (
    <div className="flex gap-2.5 group/reply">
      <img
        src={
          reply.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.userId}`
        }
        alt={reply.user?.displayName || 'User'}
        className="w-7 h-7 rounded-full flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-semibold text-xs text-gray-900">
              {reply.user?.name || reply.user?.displayName || 'Unknown User'}
            </span>
            {isPostAuthor && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-orange-100 text-orange-700">
                Tác giả
              </span>
            )}
            <RoleBadge role={reply.user?.role} />
            {reply.mentionedUser && (
              <span className="text-xs text-blue-600">@{reply.mentionedUser?.name || reply.mentionedUser?.displayName}</span>
            )}
            <span className="text-xs text-gray-500">
              {formatMessageTime(new Date(reply.createdAt))}
            </span>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{reply.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 px-2">
          <button
            onClick={handleLike}
            className={`text-xs font-medium transition ${
              localLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Heart size={12} fill={localLiked ? 'currentColor' : 'none'} />
              {localLikeCount > 0 && <span>{localLikeCount}</span>}
            </span>
          </button>

          <button
            onClick={handleReply}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition"
          >
            Trả lời
          </button>

          {isAuthor && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover/reply:opacity-100 transition"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa trả lời?</AlertDialogTitle>
              <AlertDialogDescription>Bạn chắc chắn muốn xóa trả lời này?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
