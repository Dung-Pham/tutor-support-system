import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

export function RejectedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postService.getRejectedPosts({ page, limit: 10 });
      setPosts(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching rejected posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bài viết đã từ chối</h1>
        <p className="text-muted-foreground">
          Danh sách các bài viết đã bị từ chối
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Lý do từ chối</TableHead>
              <TableHead>Ngày từ chối</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Không có bài viết nào bị từ chối
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <p className="font-medium">
                      {truncateText(post.title, 40)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{post.author?.displayName || "Unknown"}</span>
                      <Badge variant="outline">{post.author?.role}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-destructive">
                      {truncateText(
                        post.rejectionReason || "Không có lý do",
                        50
                      )}
                    </p>
                  </TableCell>
                  <TableCell>
                    {post.rejectedAt ? formatDate(post.rejectedAt) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPost(post);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {posts.length} / {total} bài viết
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Bởi {selectedPost?.author?.displayName} •{" "}
              {selectedPost && formatDate(selectedPost.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {/* Rejection Info */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-sm font-medium text-destructive">
              Lý do từ chối:
            </p>
            <p className="text-sm mt-1">{selectedPost?.rejectionReason}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Từ chối bởi {selectedPost?.rejectedBy?.displayName} vào{" "}
              {selectedPost?.rejectedAt && formatDate(selectedPost.rejectedAt)}
            </p>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{selectedPost?.contentPlain}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
