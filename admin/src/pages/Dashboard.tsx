import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Users,
  FileText,
  Clock,
  XCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Eye,
  ArrowRight,
} from "lucide-react";
import { statsService } from "@/services/statsService";
import type { StatsData, ChartDataPoint, TopPost } from "@/types/stats";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TimeRange = "7" | "30" | "90";

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
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, topPostsRes] = await Promise.all([
          statsService.getStats(),
          statsService.getTopPosts(),
        ]);
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (topPostsRes.success) {
          setTopPosts(topPostsRes.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await statsService.getChartData(parseInt(timeRange));
        if (response.success) {
          setChartData(response.data);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [timeRange]);

  const statCards = [
    {
      title: "Tổng Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500",
      growth: stats.userGrowth,
    },
    {
      title: "Tổng Bài viết",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "border-l-sky-500",
      growth: stats.postGrowth,
    },
    {
      title: "Bình luận",
      value: stats.totalComments || 0,
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-l-indigo-500",
    },
    {
      title: "Chờ duyệt",
      value: stats.pendingPosts,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-l-amber-500",
    },
    {
      title: "Đã duyệt",
      value: stats.approvedPosts,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-l-emerald-500",
    },
    {
      title: "Đã từ chối",
      value: stats.rejectedPosts,
      icon: XCircle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-l-rose-500",
    },
  ];

  // Pie chart data - Blue theme
  const pieData = [
    { name: "Đã duyệt", value: stats.approvedPosts, color: "#22c55e" },
    { name: "Chờ duyệt", value: stats.pendingPosts, color: "#3b82f6" },
    { name: "Đã từ chối", value: stats.rejectedPosts, color: "#ef4444" },
  ];

  // Area chart config - Blue theme
  const areaChartConfig = {
    posts: {
      label: "Bài viết",
      color: "#3b82f6",
    },
    users: {
      label: "Users mới",
      color: "#06b6d4",
    },
  } satisfies ChartConfig;

  // Format date for chart
  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Chào mừng trở lại! Đây là tổng quan hệ thống.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={cn(
                "border-l-4 transition-all hover:shadow-md",
                stat.borderColor
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stat.value.toLocaleString()}
                </div>
                {stat.growth !== undefined && (
                  <p
                    className={cn(
                      "text-xs flex items-center gap-1 mt-1",
                      stat.growth >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {stat.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.growth >= 0 ? "+" : ""}
                    {stat.growth}% so với tháng trước
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Area Chart - Hoạt động theo thời gian */}
        <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Hoạt động hệ thống
              </CardTitle>
              <CardDescription>
                Bài viết mới và người dùng đăng ký theo ngày
              </CardDescription>
            </div>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              {(["7", "30", "90"] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-all",
                    timeRange === range && "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={() => setTimeRange(range)}
                >
                  {range === "7"
                    ? "7 ngày"
                    : range === "30"
                    ? "30 ngày"
                    : "3 tháng"}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={areaChartConfig}
              className="h-[300px] w-full"
            >
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatChartDate}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">
                      {value === "posts" ? "Bài viết" : "Users mới"}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stroke="#3b82f6"
                  fill="url(#fillPosts)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#06b6d4"
                  fill="url(#fillUsers)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#06b6d4" }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Phân bố bài viết */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Phân bố bài viết
            </CardTitle>
            <CardDescription>Theo trạng thái duyệt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts Table */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Top 10 bài viết được yêu thích
            </CardTitle>
            <CardDescription>
              Các bài viết có lượt thích cao nhất
            </CardDescription>
          </div>
          <a
            href="/posts"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </a>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead className="text-center">
                  <span className="flex items-center justify-center gap-1">
                    ❤️ Likes
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4" /> Views
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-4 w-4" /> Comments
                  </span>
                </TableHead>
                <TableHead className="text-right">Ngày đăng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : topPosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Chưa có bài viết nào
                  </TableCell>
                </TableRow>
              ) : (
                topPosts.map((post, index) => (
                  <TableRow key={post.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/posts/${post.id}`}
                        className="font-medium hover:text-blue-600 line-clamp-1"
                        title={post.title}
                      >
                        {post.title}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author?.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {post.author?.displayName?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {post.author?.displayName || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="bg-rose-50 text-rose-600"
                      >
                        {post.likeCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-muted-foreground">
                        {post.viewCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-muted-foreground">
                        {post.commentCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="group hover:shadow-lg transition-all border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Bài viết chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Có{" "}
              <span className="font-bold text-amber-600 text-xl">
                {stats.pendingPosts}
              </span>{" "}
              bài viết đang chờ duyệt
            </p>
            <a
              href="/posts/pending"
              className="inline-flex items-center gap-1 mt-4 text-blue-600 hover:text-blue-800 font-medium group-hover:underline"
            >
              Xem danh sách
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Quản lý người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hệ thống hiện có{" "}
              <span className="font-bold text-blue-600 text-xl">
                {stats.totalUsers}
              </span>{" "}
              người dùng
            </p>
            <a
              href="/users"
              className="inline-flex items-center gap-1 mt-4 text-blue-600 hover:text-blue-800 font-medium group-hover:underline"
            >
              Quản lý users
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
