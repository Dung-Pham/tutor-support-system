import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Save, Send, Loader2, AlertCircle, FileEdit, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { createPostAsync, updatePostAsync } from '@/store/slices/postSlice';
import { getPostDetail } from '@/services/postService';
import { SimpleEditor } from '@/components/post/simple-editor';

const isEditorEmpty = (json: any): boolean => {
  if (!json || !json.content) return true;
  if (json.content.length === 0) return true;

  if (
    json.content.length === 1 &&
    json.content[0].type === 'paragraph' &&
    !json.content[0].content
  ) {
    return true;
  }

  return false;
};

export function CreatePost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { postId: routePostId } = useParams<{ postId: string }>();

  // Hỗ trợ cả query param (?id=xxx) và route param (/edit-post/:postId)
  const postId = routePostId || searchParams.get('id');
  const isEditMode = !!postId;

  const [formData, setFormData] = useState({
    title: '',
    contentJson: null as any,
  });
  const [postStatus, setPostStatus] = useState<'draft' | 'pending'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode && postId) {
      void loadPostData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, postId]);

  const loadPostData = async () => {
    try {
      setLoadingPost(true);
      const post = await getPostDetail(postId!);
      setFormData({
        title: post.title,
        contentJson: post.contentJson || null,
      });
      if (post?.status === 'pending' || post?.status === 'draft') {
        setPostStatus(post.status);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bài viết');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết');
      return;
    }

    if (!formData.contentJson || isEditorEmpty(formData.contentJson)) {
      setError('Vui lòng nhập nội dung bài viết');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      if (isEditMode && postId) {
        result = await dispatch(
          updatePostAsync({
            id: postId,
            data: {
              title: formData.title,
              contentJson: formData.contentJson,
              status,
            },
          }) as any
        );
      } else {
        result = await dispatch(
          createPostAsync({
            title: formData.title,
            contentJson: formData.contentJson,
            status,
          }) as any
        );
      }

      if (result?.payload) {
        setFormData({ title: '', contentJson: null });
        navigate('/tutor/my-posts', {
          state: {
            message: isEditMode
              ? status === 'draft'
                ? 'Bài viết đã được lưu nháp'
                : 'Bài viết đã được gửi duyệt'
              : status === 'draft'
                ? 'Bài viết đã được lưu nháp'
                : 'Bài viết đã được gửi duyệt',
            tab: status, // Chuyển đến đúng tab tương ứng với trạng thái bài viết
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xử lý bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <FileEdit className="h-5 w-5 text-primary" />
          ) : (
            <FilePlus className="h-5 w-5 text-primary" />
          )}
          <h1 className="text-xl font-semibold">
            {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {(!isEditMode || postStatus === 'draft') && (
            <Button variant="outline" onClick={() => void handleSubmit('draft')} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu nháp
            </Button>
          )}

          <Button
            onClick={() =>
              void handleSubmit(
                isEditMode ? (postStatus === 'draft' ? 'pending' : 'pending') : 'pending'
              )
            }
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isEditMode ? (postStatus === 'draft' ? 'Gửi duyệt' : 'Cập nhật') : 'Gửi duyệt'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {loadingPost ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Input
                  type="text"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={loading}
                  className="border-0 text-xl font-medium h-14 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
              </CardContent>
            </Card>

            {/* Editor Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <SimpleEditor
                  content={formData.contentJson}
                  onChange={(json) => setFormData((prev) => ({ ...prev, contentJson: json }))}
                />
              </CardContent>
            </Card>

            {/* Mobile Actions */}
            <div className="sm:hidden flex gap-2 pt-4">
              {(!isEditMode || postStatus === 'draft') && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => void handleSubmit('draft')}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Lưu nháp
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={() =>
                  void handleSubmit(
                    isEditMode ? (postStatus === 'draft' ? 'pending' : 'pending') : 'pending'
                  )
                }
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isEditMode ? (postStatus === 'draft' ? 'Gửi duyệt' : 'Cập nhật') : 'Gửi duyệt'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
