import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import { fetchPosts } from '../../store/slices/postSlice';
import PostList from '../../Components/PostList';

export default function GlobalPostPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: any) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bài viết chung</h1>
      <PostList posts={posts} isMyPosts={false} />
    </div>
  );
}
