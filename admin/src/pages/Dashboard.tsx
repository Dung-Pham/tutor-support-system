import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  Clock,
  XCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { userService } from "@/services/userService";
import { postService } from "@/services/postService";
import type { StatsData } from "@/types/stats";

export function Dashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalPosts: 0,
    pendingPosts: 0,
    rejectedPosts: 0,
    approvedPosts: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newPostsToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch data from available endpoints
        const [usersRes, pendingRes, rejectedRes, approvedRes] =
          await Promise.all([
            userService.getUsers({ limit: 1 }),
            postService.getPendingPosts({ limit: 1 }),
            postService.getRejectedPosts({ limit: 1 }),
            postService.getApprovedPosts({ limit: 1 }),
          ]);

        setStats({
          totalUsers: usersRes.pagination?.total || 0,
          totalPosts:
            (pendingRes.total || 0) +
            (rejectedRes.total || 0) +
            (approvedRes.total || 0),
          pendingPosts: pendingRes.total || 0,
          rejectedPosts: rejectedRes.total || 0,
          approvedPosts: approvedRes.total || 0,
          activeUsers: 0,
          newUsersToday: 0,
          newPostsToday: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Tổng Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tổng Bài viết",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Chờ duyệt",
      value: stats.pendingPosts,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Đã duyệt",
      value: stats.approvedPosts,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Đã từ chối",
      value: stats.rejectedPosts,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Tăng trưởng",
      value: "+12%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Chào mừng trở lại! Đây là tổng quan hệ thống.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bài viết chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Có{" "}
              <span className="font-bold text-yellow-600">
                {stats.pendingPosts}
              </span>{" "}
              bài viết đang chờ duyệt
            </p>
            <a
              href="/posts/pending"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Xem danh sách →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quản lý người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hệ thống hiện có{" "}
              <span className="font-bold text-blue-600">
                {stats.totalUsers}
              </span>{" "}
              người dùng
            </p>
            <a
              href="/users"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Quản lý users →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
