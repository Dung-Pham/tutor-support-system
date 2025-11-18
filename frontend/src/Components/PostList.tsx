import { useDispatch } from 'react-redux';
import { deletePost } from '../store/slices/postSlice';
import { Link } from 'react-router-dom';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: { firstName: string; lastName: string };
  images: string[];
  createdAt: string;
  tags: string[];
}

interface PostListProps {
  posts: Post[];
  isMyPosts: boolean;
}

export default function PostList({ posts, isMyPosts }: PostListProps) {
  const dispatch = useDispatch<any>();

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      dispatch(deletePost(id));
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          <p className="text-gray-600 mb-4">{post.content.substring(0, 200)}...</p>
          {post.images.length > 0 && (
            <div className="mb-4">
              <img
                src={post.images[0]}
                alt="Post image"
                className="w-full h-48 object-cover rounded"
              />
            </div>
          )}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Tác giả: {post.author.firstName} {post.author.lastName}
            </span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 flex space-x-2">
            <Link to={`/posts/${post._id}`} className="text-blue-600 hover:underline">
              Xem chi tiết
            </Link>
            {isMyPosts && (
              <>
                <Link
                  to={`/tutor/posts/${post._id}/edit`}
                  className="text-green-600 hover:underline"
                >
                  Sửa
                </Link>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-600 hover:underline"
                >
                  Xóa
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
