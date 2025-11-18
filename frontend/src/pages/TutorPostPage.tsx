import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../store/slices/postSlice';
import PostList from '../Components/PostList';

const TutorPostPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: any) => state.posts);
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const myPosts = posts.filter((post: any) => post.author._id === user.id);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bài viết của tôi</h1>
        <Link
          to="/tutor/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tạo bài viết mới
        </Link>
      </div>
      <Link to="/tutor/global-posts" className="text-blue-600 hover:underline mb-4 inline-block">
        Xem bài viết chung
      </Link>
      <PostList posts={myPosts} isMyPosts={true} />
    </div>
  );
};

export default TutorPostPage;
