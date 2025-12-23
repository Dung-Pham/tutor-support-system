import { useEffect, useState } from "react";
import { postService } from "@/services/postService";
import type { Post } from "@/types/post";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useNavigate, useSearchParams } from "react-router-dom";

export function PostList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("status") || "approved"
  );

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let response;
      switch (activeTab) {
        case "pending":
          response = await postService.getPendingPosts({ page, limit: 10 });
          break;
        case "rejected":
          response = await postService.getRejectedPosts({ page, limit: 10 });
          break;
        default:
          response = await postService.getApprovedPosts({ page, limit: 10 });
      }
      setPosts(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
    setSearchParams({ status: value });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Đã duyệt</Badge>;
      case "pending":
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      case "draft":
        return <Badge variant="secondary">Nháp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý bài viết</h1>
        <p className="text-muted-foreground">
          Xem và quản lý tất cả bài viết trong hệ thống
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Tiêu đề</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
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
                      Không có bài viết nào
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell>
                        <p className="font-medium">
                          {truncateText(post.title, 50)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{post.author?.displayName || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell>{post.viewCount}</TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (activeTab === "pending") {
                              navigate("/posts/pending");
                            } else if (activeTab === "rejected") {
                              navigate("/posts/rejected");
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
