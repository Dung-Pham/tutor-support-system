import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "@/services/postService";
import type { Post } from "@/types/post";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  Loader2,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

export function PendingPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postService.getPendingPosts({ page, limit: 10 });
      setPosts(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleApprove = async () => {
    if (!selectedPost) return;
    setIsProcessing(true);
    try {
      await postService.approvePost(selectedPost.id);
      await fetchPosts();
      setApproveOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Error approving post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPost || !rejectReason.trim()) return;

    setIsProcessing(true);
    try {
      await postService.rejectPost(selectedPost.id, rejectReason);
      await fetchPosts();
      setRejectOpen(false);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Bài viết chờ duyệt
      </h1>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40%] text-base font-semibold py-4">
                Tiêu đề
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Tác giả
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Ngày gửi
              </TableHead>
              <TableHead className="text-right text-base font-semibold py-4">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Không có bài viết nào đang chờ duyệt
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-base leading-snug">
                        {truncateText(post.title, 60)}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {truncateText(post.contentPlain || "", 100)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-base">
                      {post.author?.name || post.author?.displayName || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-base">
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/posts/${post.id}`)}
                        title="Xem chi tiết"
                        className="h-9 w-9"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPost(post);
                          setApproveOpen(true);
                        }}
                        disabled={isProcessing}
                        className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPost(post);
                          setRejectOpen(true);
                        }}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-red-50"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-base text-muted-foreground">
          Hiển thị{" "}
          <span className="font-medium text-foreground">{posts.length}</span> /{" "}
          <span className="font-medium text-foreground">{total}</span> bài viết
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-3 text-sm">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyệt bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn duyệt bài viết "{selectedPost?.title}"? Bài viết
              sẽ được xuất bản và hiển thị công khai trên trang cộng đồng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối bài viết "{selectedPost?.title}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason("")}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
