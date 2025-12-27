import { Post } from '@/types/post';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatMessageTime } from '@/lib/utils';
import { TiptapRenderer } from '@/components/post/TiptapRenderer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PostDetailModalProps {
  open: boolean;
  post: Post | null;
  onClose: () => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  draft: { label: 'Nháp', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  pending: { label: 'Chờ duyệt', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  approved: { label: 'Đã duyệt', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  rejected: { label: 'Từ chối', bgColor: 'bg-red-100', textColor: 'text-red-700' },
};

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  open,
  post,
  onClose,
  onDelete,
  onEdit,
  isLoading = false,
}) => {
  if (!post) return null;

  const statusInfo = statusConfig[post.status] || statusConfig.draft;

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(post.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Title at top */}
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-left">{post.title}</DialogTitle>
          <DialogDescription className="sr-only">Chi tiết bài viết</DialogDescription>
        </DialogHeader>

        {/* Meta info below title */}
        <div className="space-y-3 pb-4 border-b -mt-2">
          {/* Author & Date */}
          <div className="flex items-center gap-3">
            <img
              src={
                post.author?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.id}`
              }
              alt={post.author?.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {post.author?.displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatMessageTime(new Date(post.createdAt))}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Tiptap Content - render đúng format */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <TiptapRenderer content={post.contentJson} />
          </div>

          {/* Rejection Reason */}
          {post.status === 'rejected' && post.rejectionReason && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                Lý do từ chối:
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">{post.rejectionReason}</p>
            </div>
          )}

          {/* Approval Info */}
          {post.status === 'approved' && post.approvedAt && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ✓ Đã duyệt vào lúc{' '}
                <span className="font-semibold">
                  {formatMessageTime(new Date(post.approvedAt))}
                </span>
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Cập nhật</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatMessageTime(new Date(post.updatedAt))}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-4 border-t flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {onEdit && post.status === 'draft' && (
            <Button
              onClick={() => {
                onEdit(post.id);
                onClose();
              }}
              disabled={isLoading}
            >
              Chỉnh sửa
            </Button>
          )}
          {onDelete && (post.status === 'draft' || post.status === 'pending') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  Xóa bài viết
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn chắc chắn muốn xóa bài viết này?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
