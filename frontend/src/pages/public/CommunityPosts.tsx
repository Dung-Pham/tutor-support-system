import { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PostCard } from '@/components/post/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import * as postService from '@/services/postService';
import type { Post } from '@/types/post';
import type { RootState } from '@/store';

export function CommunityPosts() {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const isTutor = user?.role?.toLowerCase() === 'tutor';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset về trang 1 khi search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter posts by search
  const filteredPosts = useMemo(() => {
    if (!debouncedSearch.trim()) return posts;
    const query = debouncedSearch.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.contentPlain?.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query)
    );
  }, [posts, debouncedSearch]);

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4 py-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-11 w-32" />
        </div>
        {/* Search skeleton */}
        <Skeleton className="h-11 w-full max-w-md" />
        {/* Posts skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
        {/* Pagination skeleton */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Skeleton className="h-11 w-20" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-11 w-16" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Bài viết từ cộng đồng</h1>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchApprovedPosts}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header với nút tạo bài */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Bài viết từ cộng đồng</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Khám phá những bài viết hữu ích từ các gia sư trên nền tảng
          </p>
        </div>
        {isTutor && (
          <Link to="/tutor/create-post">
            <Button className="gap-2 min-h-[44px] touch-manipulation w-full sm:w-auto">
              <PlusCircle size={18} />
              Tạo bài viết
            </Button>
          </Link>
        )}
      </div>

      {/* Search box */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung, tác giả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 min-h-[44px]"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {debouncedSearch
              ? `Không tìm thấy bài viết với "${debouncedSearch}"`
              : 'Chưa có bài viết nào'}
          </p>
          {debouncedSearch ? (
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              className="touch-manipulation min-h-[44px]"
            >
              Xóa tìm kiếm
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={fetchApprovedPosts}
              className="touch-manipulation min-h-[44px]"
            >
              Làm mới
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Search result info */}
          {debouncedSearch && (
            <p className="text-sm text-gray-500 mb-4">
              Tìm thấy {filteredPosts.length} bài viết với "{debouncedSearch}"
            </p>
          )}

          {/* Posts Grid */}
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isCommunity={true}
                linkState={{ backTo: location.pathname }}
              />
            ))}
          </div>

          {/* Pagination - chỉ hiện khi không search */}
          {totalPages > 1 && !debouncedSearch && (
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 pb-6 sm:pb-8 flex-wrap">
              <Button
                className="touch-manipulation min-h-[44px] px-4"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                Trước
              </Button>

              <div className="flex items-center gap-1">
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
                      className="min-h-[44px] w-11 p-0 touch-manipulation"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="touch-manipulation min-h-[44px] px-4"
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
