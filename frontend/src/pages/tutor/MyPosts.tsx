import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  getMyPostsAsync,
  deletePostAsync,
  getPostDetailAsync,
  setShowDetailModal,
  setSelectedPost,
  setCurrentStatus,
  setCurrentPage,
} from '@/store/slices/postSlice';
import { Post, PostStatus } from '@/types/post';
import { PostList } from '@/components/post/PostList';
import { PostDetailModal } from '@/components/post/PostDetailModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

const TABS = [
  { value: 'draft', label: 'Nháp', count: 0 },
  { value: 'pending', label: 'Chờ duyệt', count: 0 },
  { value: 'approved', label: 'Đã duyệt', count: 0 },
  { value: 'rejected', label: 'Từ chối', count: 0 },
];

export function MyPosts() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    myPosts,
    loading,
    error,
    currentPage,
    currentStatus,
    selectedPost,
    showDetailModal,
    total,
    limit,
  } = useSelector((state: RootState) => state.posts);

  // Load posts khi mount hoặc khi đổi tab/page
  useEffect(() => {
    dispatch(
      getMyPostsAsync({
        status: currentStatus === 'all' ? undefined : (currentStatus as PostStatus),
        page: currentPage,
        limit,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus, currentPage, limit]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    dispatch(setCurrentStatus(value as PostStatus | 'all'));
  };

  // Handle post click
  const handlePostClick = (post: Post) => {
    if (post.status === 'approved') {
      // Bài viết đã duyệt → chuyển đến trang xem cộng đồng của gia sư
      navigate(`/tutor/posts/${post.id}`);
    } else {
      // Các trạng thái khác → mở modal với chi tiết đầy đủ
      dispatch(getPostDetailAsync(post.id));
    }
  };

  // Handle post delete
  const handlePostDelete = (postId: string) => {
    dispatch(deletePostAsync(postId))
      .then(() => {
        // Reload posts sau khi xóa
        dispatch(
          getMyPostsAsync({
            status: currentStatus === 'all' ? undefined : (currentStatus as PostStatus),
            page: currentPage,
            limit,
          })
        );
      })
      .catch((err) => {
        // Hiển thị thông báo lỗi chi tiết
        const errorMsg = err?.payload?.message || err?.message || 'Lỗi xóa bài viết';
        console.error('Delete post error:', errorMsg);
        // Có thể thêm toast notification ở đây nếu có
      });
  };

  // Handle modal close
  const handleCloseModal = () => {
    dispatch(setShowDetailModal(false));
    dispatch(setSelectedPost(null));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  // Handle post edit - sử dụng route mới
  const handlePostEdit = (postId: string) => {
    navigate(`/tutor/edit-post/${postId}`);
  };

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Bài viết của tôi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý và theo dõi các bài viết của bạn
          </p>
        </div>
        <Button onClick={() => navigate('/tutor/create-post')} className="gap-2">
          <Plus className="w-4 h-4" />
          Viết bài mới
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={currentStatus} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Contents */}
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <PostList
                posts={myPosts}
                loading={loading}
                currentPage={currentPage}
                total={total}
                limit={limit}
                onPostClick={handlePostClick}
                onPostDelete={handlePostDelete}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Modal */}
      <PostDetailModal
        open={showDetailModal}
        post={selectedPost}
        onClose={handleCloseModal}
        onDelete={handlePostDelete}
        onEdit={handlePostEdit}
        isLoading={loading}
      />
    </div>
  );
}

export default MyPosts;
