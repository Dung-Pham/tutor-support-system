import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postService } from '../services/postService';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; firstName: string; lastName: string };
  images: string[];
  createdAt: string;
  tags: string[];
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        try {
          const data = await postService.getPostById(id);
          setPost(data);
        } catch (error) {
          console.error('Failed to fetch post', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/posts" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Quay lại
      </Link>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-4">
        Tác giả: {post.author.firstName} {post.author.lastName}
      </p>
      <div className="mb-6">
        {post.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Image ${index + 1}`}
            className="w-full h-64 object-cover rounded mb-4"
          />
        ))}
      </div>
      <p className="text-lg mb-4">{post.content}</p>
      <div className="mb-4">
        {post.tags.map((tag) => (
          <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Ngày tạo: {new Date(post.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
