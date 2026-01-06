import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "@/services/postService";
import type { Post } from "@/types/post";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

export function DeletedPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postService.getDeletedPosts({ page, limit: 10 });
      setPosts(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching deleted posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleRestore = async () => {
    if (!selectedPost) return;

    setIsProcessing(true);
    try {
      await postService.restorePost(selectedPost.id);
      setRestoreDialogOpen(false);
      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      console.error("Error restoring post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHardDelete = async () => {
    if (!selectedPost) return;

    setIsProcessing(true);
    try {
      await postService.hardDeletePost(selectedPost.id);
      setHardDeleteDialogOpen(false);
      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      console.error("Error hard deleting post:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Bài viết đã xóa
      </h1>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[30%] min-w-[280px] text-base font-semibold py-4">
                Tiêu đề
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Tác giả
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Lý do xóa
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Người xóa
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Ngày xóa
              </TableHead>
              <TableHead className="text-right text-base font-semibold py-4">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Không có bài viết nào đã xóa
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-medium text-base leading-snug">
                      {truncateText(post.title, 45)}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {post.author?.name || post.author?.displayName || "Unknown"}
                      </span>
                      <Badge variant="outline">{post.author?.role}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="text-base text-muted-foreground">
                      {truncateText(post.deleteReason || "Không có lý do", 40)}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-base">
                      {post.deletedByUser?.name || post.deletedByUser?.displayName || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-base">
                    {post.deletedAt ? formatDate(post.deletedAt) : "-"}
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
                        className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => {
                          setSelectedPost(post);
                          setRestoreDialogOpen(true);
                        }}
                        title="Khôi phục"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-red-50"
                        onClick={() => {
                          setSelectedPost(post);
                          setHardDeleteDialogOpen(true);
                        }}
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 className="h-5 w-5" />
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
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="flex items-center px-4 text-base font-medium">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="h-9 w-9"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khôi phục bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết "{selectedPost?.title}" sẽ được khôi phục về trạng thái
              đã duyệt và hiển thị công khai.
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              Bài viết "{selectedPost?.title}" sẽ bị xóa vĩnh viễn và không thể
              khôi phục. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
