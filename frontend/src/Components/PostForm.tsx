import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createPost, updatePost } from '../store/slices/postSlice';
import { postService } from '../services/postService';

interface PostFormData {
  title: string;
  content: string;
  images: string[];
  tags: string[];
}

export default function PostForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    images: [],
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && id) {
      const fetchPost = async () => {
        try {
          const post = await postService.getPostById(id);
          setFormData({
            title: post.title,
            content: post.content,
            images: post.images,
            tags: post.tags,
          });
        } catch (error) {
          console.error('Failed to fetch post', error);
        }
      };
      fetchPost();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploading(true);
      try {
        const uploadPromises = Array.from(files).map((file) => postService.uploadImage(file));
        const responses = await Promise.all(uploadPromises);
        const urls = responses.map((response) => response.url);
        setFormData({ ...formData, images: [...formData.images, ...urls] });
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && id) {
        await (dispatch as any)(updatePost({ id, postData: formData }));
      } else {
        await (dispatch as any)(createPost(formData));
      }
      navigate('/tutor/posts');
    } catch (error) {
      console.error('Submit failed', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nội dung</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Ảnh</label>
          <input type="file" onChange={handleImageUpload} accept="image/*" multiple />
          {uploading && <p>Uploading...</p>}
          <div className="mt-2 flex flex-wrap">
            {formData.images.map((image, index) => (
              <div key={index} className="relative mr-2 mb-2">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      images: formData.images.filter((_, i) => i !== index),
                    })
                  }
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 p-2 border rounded-l"
              placeholder="Thêm tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-r"
            >
              Thêm
            </button>
          </div>
          <div className="mt-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-red-600"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? 'Cập nhật' : 'Tạo bài viết'}
        </button>
      </form>
    </div>
  );
}
