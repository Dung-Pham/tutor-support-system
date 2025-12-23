import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LoginPage } from "@/pages/auth/Login";
import { Dashboard } from "@/pages/Dashboard";
import { UserList } from "@/pages/users/UserList";
import { PostList } from "@/pages/posts/PostList";
import { PendingPosts } from "@/pages/posts/PendingPosts";
import { RejectedPosts } from "@/pages/posts/RejectedPosts";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected admin routes */}
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="posts" element={<PostList />} />
        <Route path="posts/pending" element={<PendingPosts />} />
        <Route path="posts/rejected" element={<RejectedPosts />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">Trang không tồn tại</p>
        <a href="/" className="text-primary hover:underline mt-4 inline-block">
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
