import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LoginPage } from "@/pages/auth/Login";

// Lazy load pages
const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const UserList = lazy(() =>
  import("@/pages/users/UserList").then((m) => ({ default: m.UserList }))
);
const PendingPosts = lazy(() =>
  import("@/pages/posts/PendingPosts").then((m) => ({
    default: m.PendingPosts,
  }))
);
const RejectedPosts = lazy(() =>
  import("@/pages/posts/RejectedPosts").then((m) => ({
    default: m.RejectedPosts,
  }))
);
const DeletedPosts = lazy(() =>
  import("@/pages/posts/DeletedPosts").then((m) => ({
    default: m.DeletedPosts,
  }))
);
const CommunityPosts = lazy(() =>
  import("@/pages/posts/CommunityPosts").then((m) => ({
    default: m.CommunityPosts,
  }))
);
const PostDetail = lazy(() =>
  import("@/pages/posts/PostDetail").then((m) => ({
    default: m.PostDetail,
  }))
);

// Loading fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected admin routes */}
      <Route element={<AdminLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserList />
            </Suspense>
          }
        />
        <Route
          path="posts"
          element={
            <Suspense fallback={<PageLoader />}>
              <CommunityPosts />
            </Suspense>
          }
        />
        <Route
          path="posts/pending"
          element={
            <Suspense fallback={<PageLoader />}>
              <PendingPosts />
            </Suspense>
          }
        />
        <Route
          path="posts/rejected"
          element={
            <Suspense fallback={<PageLoader />}>
              <RejectedPosts />
            </Suspense>
          }
        />
        <Route
          path="posts/deleted"
          element={
            <Suspense fallback={<PageLoader />}>
              <DeletedPosts />
            </Suspense>
          }
        />
        <Route
          path="posts/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <PostDetail />
            </Suspense>
          }
        />
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
