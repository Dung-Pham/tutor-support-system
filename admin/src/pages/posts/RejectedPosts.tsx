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

import { Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

export function RejectedPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Bài viết đã từ chối
      </h1>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[35%] min-w-[300px] text-base font-semibold py-4">
                Tiêu đề
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Tác giả
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Lý do từ chối
              </TableHead>
              <TableHead className="text-base font-semibold py-4">
                Ngày từ chối
              </TableHead>
              <TableHead className="text-right text-base font-semibold py-4">
                Hành động
              </TableHead>
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
                <TableRow key={post.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-medium text-base leading-snug">
                      {truncateText(post.title, 50)}
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
                    <p className="text-base text-destructive">
                      {truncateText(
                        post.rejectionReason || "Không có lý do",
                        60
                      )}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 text-base">
                    {post.rejectedAt ? formatDate(post.rejectedAt) : "-"}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/posts/${post.id}`)}
                        title="Xem chi tiết"
                        className="h-9 w-9"
                      >
                        <Eye className="h-5 w-5" />
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
    </div>
  );
}
