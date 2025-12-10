/**
 * File: pages/tutor/CreatePost.tsx
 * Mục đích: Trang tạo bài viết mới hoặc chỉnh sửa draft với Rich Text Editor
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/post/RichTextEditor';
import { createPostAsync, updatePostAsync } from '@/store/slices/postSlice';
import { getPostDetail } from '@/services/postService';

export function CreatePost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const postId = searchParams.get('id');
  const isEditMode = !!postId;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  // Load existing post data when editing
  useEffect(() => {
    if (isEditMode && postId) {
      loadPostData();
    }
  }, [postId, isEditMode]);

  const loadPostData = async () => {
    try {
      setLoadingPost(true);
      const post = await getPostDetail(postId!);
      setFormData({
        title: post.title,
        content: post.content,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bài viết');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleContentChange = (htmlContent: string) => {
    setFormData((prev) => ({
      ...prev,
      content: htmlContent,
    }));
  };

  const saveDraft = async () => {
    await handleSubmit('draft');
  };

  const submitPost = async () => {
    await handleSubmit('pending');
  };

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết');
      return;
    }

    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung bài viết');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      if (isEditMode && postId) {
        // Update existing post (only title/content, status stays the same)
        result = await dispatch(
          updatePostAsync({
            id: postId,
            data: {
              title: formData.title,
              content: formData.content,
            },
          }) as any
        );
      } else {
        // Create new post
        result = await dispatch(
          createPostAsync({
            title: formData.title,
            content: formData.content,
            status,
          }) as any
        );
      }

      if (result.payload) {
        // Reset form
        setFormData({ title: '', content: '' });

        // Navigate to MyPosts with success message
        navigate('/tutor/my-posts', {
          state: {
            message: isEditMode
              ? 'Bài viết đã được cập nhật'
              : status === 'draft'
                ? 'Bài viết đã được lưu nháp'
                : 'Bài viết đã được gửi duyệt',
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xử lý bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title.trim() || formData.content.trim()) {
      if (window.confirm('Bạn có chắc muốn hủy? Nội dung sẽ không được lưu.')) {
        navigate('/tutor/posts');
      }
    } else {
      navigate('/tutor/posts');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? 'Cập nhật nội dung bài viết của bạn'
            : 'Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 space-y-6 border border-gray-100">
        {loadingPost ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">Đang tải bài viết...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-xl font-semibold text-gray-800">Tiêu đề bài viết</label>
              <Input
                type="text"
                placeholder="Nhập tiêu đề bài viết..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                disabled={loading}
                maxLength={200}
                className="text-lg h-14 px-4 border-2 border-gray-200 focus:border-blue-500 focus:outline-none rounded-lg"
              />
              <div className="text-sm text-gray-500 text-right">
                {(formData.title || '').length} / 200 ký tự
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <label className="block text-xl font-semibold text-gray-800">Nội dung bài viết</label>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500">
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  disabled={loading}
                  placeholder="Nhập nội dung bài viết của bạn..."
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-lg text-red-700 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>{error}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="text-base h-12 px-8 min-w-max border-2 border-gray-300 hover:bg-gray-50"
              >
                Hủy
              </Button>
              <div className="flex gap-3">
                {!isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    disabled={loading}
                    className="text-base h-12 px-8 min-w-max border-2 border-gray-300 hover:bg-gray-50"
                  >
                    Lưu nháp
                  </Button>
                )}
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base h-12 px-8 min-w-max rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  onClick={isEditMode ? saveDraft : submitPost}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : isEditMode ? '✓ Cập nhật' : '✓ Gửi duyệt'}
                </Button>
              </div>
            </div>

            {/* Info Message */}
            {!isEditMode && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 text-base text-blue-800">
                <div className="flex gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <strong className="block mb-1">Ghi chú:</strong>
                    <p className="text-sm">
                      Nếu chọn "Lưu nháp", bài viết sẽ được lưu để chỉnh sửa sau. Nếu chọn "Gửi
                      duyệt", bài viết sẽ được gửi cho quản trị viên để duyệt trước khi hiển thị
                      công khai.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
