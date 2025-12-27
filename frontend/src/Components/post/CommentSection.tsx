import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { getCommentsAsync, createCommentAsync, clearComments } from '@/store/slices/commentSlice';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';

interface CommentSectionProps {
  postId: string;
  commentCount?: number;
  postAuthorId?: string;
}

export function CommentSection({ postId, commentCount = 0, postAuthorId }: CommentSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { commentsByPost, loadingComments, commentsPage, commentsTotalPages, commentsTotal } =
    useSelector((state: RootState) => state.comments);

  const comments = commentsByPost[postId] || [];

  useEffect(() => {
    dispatch(getCommentsAsync({ postId, page: 1, limit: 10 }));

    return () => {
      dispatch(clearComments(postId));
    };
  }, [dispatch, postId]);

  const handleLoadMore = () => {
    if (commentsPage < commentsTotalPages) {
      dispatch(getCommentsAsync({ postId, page: commentsPage + 1, limit: 10 }));
    }
  };

  const handleSubmitComment = async (content: string) => {
    await dispatch(createCommentAsync({ postId, content })).unwrap();
  };

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={22} className="text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">
          Bình luận ({commentsTotal || commentCount})
        </h2>
      </div>

      {/* Comment Form */}
      <div className="mb-6">
        <CommentForm onSubmit={handleSubmitComment} placeholder="Viết bình luận của bạn..." />
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loadingComments && comments.length === 0 ? (
          // Initial loading
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          // Empty state
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có bình luận nào</p>
            <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <>
            {/* Comments */}
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                postAuthorId={postAuthorId}
              />
            ))}

            {/* Load more */}
            {commentsPage < commentsTotalPages && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingComments}
                  className="gap-2"
                >
                  {loadingComments ? <Loader2 size={16} className="animate-spin" /> : null}
                  Xem thêm bình luận
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
