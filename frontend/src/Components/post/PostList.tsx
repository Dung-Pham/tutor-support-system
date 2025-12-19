import { Post } from '@/types/post';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PostListProps {
  posts: Post[];
  loading: boolean;
  currentPage: number;
  total: number;
  limit: number;
  onPostClick?: (post: Post) => void;
  onPostDelete?: (postId: string) => void;
  onPageChange?: (page: number) => void;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  loading,
  currentPage,
  total,
  limit,
  onPostClick,
  onPostDelete,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / limit);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
          Không có bài viết
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Hãy tạo bài viết đầu tiên của bạn</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Posts List */}
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            isAuthor={true}
            onView={(postId) => {
              const selectedPost = posts.find((p) => p._id === postId);
              if (selectedPost) onPostClick?.(selectedPost);
            }}
            onDelete={onPostDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange?.(page)}
                className="w-9 h-9 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
        Hiển thị {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, total)} trên {total}{' '}
        bài viết
      </div>
    </div>
  );
};
