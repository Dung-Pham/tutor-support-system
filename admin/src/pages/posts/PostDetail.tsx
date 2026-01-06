import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postService } from "@/services/postService";
import { commentService } from "@/services/commentService";
import type { Post } from "@/types/post";
import type { Comment, Reply } from "@/types/comment";
import { TiptapRenderer } from "@/components/tiptap/TiptapRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Loader2,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
  RotateCcw,
  Ban,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import type { JSONContent } from "@tiptap/core";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);

  // Replies state - track which comments have expanded replies
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [repliesData, setRepliesData] = useState<Record<string, Reply[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"comment" | "reply">("comment");
  const [deleteId, setDeleteId] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Post action states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [removeReason, setRemoveReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await postService.getPostById(id);
      setPost(response.data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(
    async (page: number = 1) => {
      if (!id) return;

      setIsLoadingComments(true);
      try {
        const response = await commentService.getComments(id, {
          page,
          limit: 10,
        });
        setComments(response.data);
        setCommentsPage(response.page);
        setCommentsTotalPages(response.totalPages);
        setCommentsTotal(response.total);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    },
    [id]
  );

  const fetchReplies = async (commentId: string) => {
    setLoadingReplies((prev) => new Set(prev).add(commentId));
    try {
      const response = await commentService.getReplies(commentId, {
        page: 1,
        limit: 50,
      });
      setRepliesData((prev) => ({
        ...prev,
        [commentId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoadingReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    const isExpanded = expandedReplies.has(commentId);
    if (isExpanded) {
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    } else {
      setExpandedReplies((prev) => new Set(prev).add(commentId));
      if (!repliesData[commentId]) {
        fetchReplies(commentId);
      }
    }
  };

  // Kiểm tra xem bài có thể có comments không (chỉ approved hoặc deleted)
  const canHaveComments =
    post?.status === "approved" || post?.status === "deleted";

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Chỉ fetch comments khi post đã load và có thể có comments
  useEffect(() => {
    if (post && canHaveComments) {
      fetchComments(1);
    }
  }, [post, canHaveComments, fetchComments]);

  const handleDeleteComment = (commentId: string) => {
    setDeleteType("comment");
    setDeleteId(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReply = (replyId: string) => {
    setDeleteType("reply");
    setDeleteId(replyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteType === "comment") {
        await commentService.deleteComment(deleteId);
        setComments((prev) => prev.filter((c) => c.id !== deleteId));
        setCommentsTotal((prev) => prev - 1);
      } else {
        await commentService.deleteReply(deleteId);
        // Update replies data
        setRepliesData((prev) => {
          const updated = { ...prev };
          for (const commentId in updated) {
            updated[commentId] = updated[commentId].filter(
              (r) => r.id !== deleteId
            );
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Post action handlers
  const handleApprove = async () => {
    if (!post) return;
    setIsProcessing(true);
    try {
      await postService.approvePost(post.id);
      await fetchPost();
      setApproveDialogOpen(false);
    } catch (error) {
      console.error("Error approving post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!post || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await postService.rejectPost(post.id, rejectReason);
      await fetchPost();
      setRejectDialogOpen(false);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromCommunity = async () => {
    if (!post) return;
    setIsProcessing(true);
    try {
      await postService.deletePost(post.id, removeReason || undefined);
      await fetchPost();
      setRemoveDialogOpen(false);
      setRemoveReason("");
    } catch (error) {
      console.error("Error removing post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!post) return;
    setIsProcessing(true);
    try {
      await postService.restorePost(post.id);
      await fetchPost();
      setRestoreDialogOpen(false);
    } catch (error) {
      console.error("Error restoring post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHardDelete = async () => {
    if (!post) return;
    setIsProcessing(true);
    try {
      await postService.hardDeletePost(post.id);
      navigate(-1);
    } catch (error) {
      console.error("Error hard deleting post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Đã duyệt</Badge>;
      case "pending":
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      case "deleted":
        return <Badge variant="secondary">Đã xóa</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="text-xs">
            Admin
          </Badge>
        );
      case "tutor":
        return (
          <Badge variant="default" className="text-xs bg-blue-600">
            Gia sư
          </Badge>
        );
      case "student":
        return (
          <Badge variant="secondary" className="text-xs">
            Học sinh
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy bài viết</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết bài viết</h1>
        </div>

        {/* Action Buttons based on status */}
        <div className="flex items-center gap-2">
          {post.status === "pending" && (
            <>
              <Button
                onClick={() => setApproveDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                <Check className="h-4 w-4 mr-2" />
                Duyệt bài
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
            </>
          )}

          {post.status === "approved" && (
            <Button
              variant="destructive"
              onClick={() => setRemoveDialogOpen(true)}
              disabled={isProcessing}
            >
              <Ban className="h-4 w-4 mr-2" />
              Loại khỏi trang bài viết cộng đồng
            </Button>
          )}

          {post.status === "deleted" && (
            <>
              <Button
                onClick={() => setRestoreDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Khôi phục
              </Button>
              <Button
                variant="destructive"
                onClick={() => setHardDeleteDialogOpen(true)}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa vĩnh viễn
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Post Content Card */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Status & Stats */}
          <div className="flex items-center justify-between">
            {getStatusBadge(post.status)}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {post.commentCount}
              </span>
            </div>
          </div>

          {/* Title */}
          <CardTitle className="text-xl">{post.title}</CardTitle>

          {/* Author & Date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatarUrl} />
                <AvatarFallback>
                  {(post.author?.name || post.author?.displayName)?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {post.author?.name || post.author?.displayName || "Ẩn danh"}
                  </span>
                  {post.author?.role && getRoleBadge(post.author.role)}
                </div>
              </div>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </div>
          </div>

          {/* Rejection reason if rejected */}
          {post.status === "rejected" && post.rejectionReason && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Lý do từ chối:</strong> {post.rejectionReason}
              </p>
            </div>
          )}

          {/* Delete reason if deleted */}
          {post.status === "deleted" && post.deleteReason && (
            <div className="p-3 bg-muted border rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Lý do xóa:</strong> {post.deleteReason}
              </p>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {post.contentJson ? (
            <TiptapRenderer content={post.contentJson as JSONContent} />
          ) : (
            <p className="text-muted-foreground italic">Không có nội dung</p>
          )}
        </CardContent>
      </Card>

      {/* Comments Section - Chỉ hiển thị cho bài đã duyệt hoặc đã xóa */}
      {canHaveComments ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Bình luận ({commentsTotal})
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Chưa có bình luận nào
              </p>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    {/* Comment */}
                    <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.user?.avatarUrl} />
                        <AvatarFallback>
                          {(comment.user?.name || comment.user?.displayName)?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {comment.user?.name || comment.user?.displayName || "Ẩn danh"}
                            </span>
                            {comment.user?.role &&
                              getRoleBadge(comment.user.role)}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                            {comment.isEdited && (
                              <span className="text-xs text-muted-foreground">
                                (đã sửa)
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {comment.likeCount}
                          </span>
                          {comment.replyCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => toggleReplies(comment.id)}
                            >
                              {expandedReplies.has(comment.id) ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Ẩn {comment.replyCount} phản hồi
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Xem {comment.replyCount} phản hồi
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {expandedReplies.has(comment.id) && (
                      <div className="ml-12 space-y-2">
                        {loadingReplies.has(comment.id) ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          repliesData[comment.id]?.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex gap-3 p-3 bg-muted/30 rounded-lg border-l-2 border-primary/20"
                            >
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarImage src={reply.user?.avatarUrl} />
                                <AvatarFallback>
                                  {(reply.user?.name || reply.user?.displayName)?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {reply.user?.name || reply.user?.displayName || "Ẩn danh"}
                                    </span>
                                    {reply.user?.role &&
                                      getRoleBadge(reply.user.role)}
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteReply(reply.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm mt-1">
                                  {reply.mentionedUser && (
                                    <span className="text-primary font-medium">
                                      @{reply.mentionedUser.name || reply.mentionedUser.displayName}{" "}
                                    </span>
                                  )}
                                  {reply.content}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {reply.likeCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {commentsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={commentsPage <= 1}
                      onClick={() => fetchComments(commentsPage - 1)}
                    >
                      Trang trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {commentsPage} / {commentsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={commentsPage >= commentsTotalPages}
                      onClick={() => fetchComments(commentsPage + 1)}
                    >
                      Trang sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Bài viết chưa được duyệt nên không có bình luận
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              {deleteType === "comment" ? "bình luận" : "phản hồi"} này? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyệt bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết "{post.title}" sẽ được xuất bản và hiển thị công khai
              trên trang cộng đồng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Duyệt bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối bài viết "{post.title}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              onClick={() => setRejectReason("")}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove from Community Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Loại khỏi trang bài viết cộng đồng?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết "{post.title}" sẽ bị xóa khỏi trang cộng đồng và chuyển
              vào thùng rác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Lý do xóa (không bắt buộc)..."
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              onClick={() => setRemoveReason("")}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromCommunity}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Xóa bài viết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khôi phục bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết "{post.title}" sẽ được khôi phục về trạng thái đã duyệt
              và hiển thị công khai trên trang cộng đồng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Khôi phục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Dialog */}
      <AlertDialog
        open={hardDeleteDialogOpen}
        onOpenChange={setHardDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa vĩnh viễn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết "{post.title}" sẽ bị xóa vĩnh viễn và không thể khôi
              phục. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
