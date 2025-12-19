import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PostCard } from '@/components/post/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import * as postService from '@/services/postService';
import type { Post } from '@/types/post';

export function CommunityPosts() {
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch approved posts
  useEffect(() => {
    fetchApprovedPosts();
  }, [page]);

  const fetchApprovedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getApprovedPosts(page, limit);
      setPosts(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Lỗi tải bài viết');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto space-y-4">
        <h1 className="text-3xl font-bold mb-6">Bài viết từ cộng đồng</h1>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bài viết từ cộng đồng</h1>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchApprovedPosts}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bài viết từ cộng đồng</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Khám phá những bài viết hữu ích từ các gia sư trên nền tảng
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Chưa có bài viết nào</p>
          <Button
            variant="outline"
            onClick={fetchApprovedPosts}
            className="touch-manipulation min-h-[44px]"
          >
            Làm mới
          </Button>
        </div>
      ) : (
        <>
          {/* Posts Grid */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                isCommunity={true}
                linkState={{ backTo: location.pathname }}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 pb-6 sm:pb-8 flex-wrap">
              <Button
                className="touch-manipulation min-h-[44px] px-4"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                Trước
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
              >
                Sau
              </Button>

              <span className="text-sm text-gray-600 ml-4">
                Trang {page} / {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CommunityPosts;
