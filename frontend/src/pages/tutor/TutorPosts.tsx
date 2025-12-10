/**
 * File: pages/tutor/TutorPosts.tsx
 * Mục đích: Trang xem bài viết đã approve (feed)
 */

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';

export function TutorPosts() {
  const { posts, loading } = useSelector(
    (state: RootState) => state.posts || { posts: [], loading: false }
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Bài viết từ cộng đồng</h1>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chưa có bài viết nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Posts will be rendered here */}
          {/* TODO: Map posts and render PostCard component */}
          <div className="p-4 bg-secondary rounded-lg">
            <p>Bài viết sẽ hiển thị ở đây</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorPosts;
