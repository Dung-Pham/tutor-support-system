import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import StudentRegistrationPage from '../pages/public/StudentRegistrationPage';
import TutorRegistrationPage from '../pages/public/TutorRegistrationPage';
import CommunityPosts from '../pages/public/CommunityPosts';
import PostDetailPage from '../pages/public/PostDetail';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

// === LAZY LOADED PAGES - Load khi cần ===

// Student pages (chỉ load khi user là student)
const StudentLayout = lazy(() =>
  import('@/pages/student/StudentLayout').then((m) => ({ default: m.StudentLayout }))
);
const StudentMessages = lazy(() => import('@/pages/student/StudentMessages'));

// Tutor pages (chỉ load khi user là tutor)
const TutorLayout = lazy(() =>
  import('@/pages/tutor/TutorLayout').then((m) => ({ default: m.TutorLayout }))
);
const CreatePost = lazy(() => import('@/pages/tutor/CreatePost'));
const MyPosts = lazy(() => import('@/pages/tutor/MyPosts'));
const TutorMessages = lazy(() => import('@/pages/tutor/TutorMessages')); // Có Emoji picker (100 KB)
const TutorStudents = lazy(() => import('@/pages/tutor/TutorStudents'));
const TutorSchedule = lazy(() => import('@/pages/tutor/TutorSchedule'));
const TutorStatistics = lazy(() => import('@/pages/tutor/TutorStatistics'));
const TutorSettings = lazy(() => import('@/pages/tutor/TutorSettings'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes - Load ngay */}
      <Route path="/" element={<HomePage />} />

      {/* Authentication routes - Load ngay */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/student" element={<StudentRegistrationPage />} />
      <Route path="/register/tutor" element={<TutorRegistrationPage />} />
      <Route path="/posts" element={<CommunityPosts />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/posts/:id/:slug" element={<PostDetailPage />} />

      {/* Protected Routes cho Student - Lazy loaded */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
          <Route
            path="/student"
            element={
              <Suspense fallback={<PageLoader />}>
                <StudentLayout />
              </Suspense>
            }
          >
            <Route index element={<div>Dashboard Student</div>} />
            <Route path="schedule" element={<div>Lịch học</div>} />
            <Route path="classes" element={<div>Lớp học của tôi</div>} />
            <Route path="assignments" element={<div>Bài tập</div>} />
            <Route path="posts" element={<CommunityPosts />} />
            <Route path="documents" element={<div>Tài liệu</div>} />
            <Route
              path="messages"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StudentMessages />
                </Suspense>
              }
            />
            <Route path="statistics" element={<div>Thống kê</div>} />
            <Route path="settings" element={<div>Cài đặt</div>} />
          </Route>
        </Route>
      </Route>

      {/* Protected Routes cho Tutor - Lazy loaded */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['tutor']} />}>
          <Route
            path="/tutor"
            element={
              <Suspense fallback={<PageLoader />}>
                <TutorLayout />
              </Suspense>
            }
          >
            <Route index element={<CommunityPosts />} />
            <Route path="posts" element={<CommunityPosts />} />
            <Route
              path="create-post"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreatePost />
                </Suspense>
              }
            />
            <Route
              path="my-posts"
              element={
                <Suspense fallback={<PageLoader />}>
                  <MyPosts />
                </Suspense>
              }
            />
            <Route
              path="messages"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorMessages />
                </Suspense>
              }
            />
            <Route
              path="students"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorStudents />
                </Suspense>
              }
            />
            <Route
              path="schedule"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorSchedule />
                </Suspense>
              }
            />
            <Route
              path="statistics"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorStatistics />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorSettings />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* Unauthorized page */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
              <p className="text-gray-600">Bạn không có quyền truy cập vào trang này.</p>
            </div>
          </div>
        }
      />

      {/* 404 page */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};
