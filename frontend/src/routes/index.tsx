/**
 * File: routes/index.tsx
 * Mục đích: Central routing configuration cho hệ thống Student-Tutor
 * Vai trò:
 *   - Định nghĩa tất cả routes của app (chỉ Student và Tutor)
 *   - Tách logic routing ra khỏi App.tsx
 *   - Routes cho authentication flow và role-based home pages
 *   - Protected routes cho Student và Tutor
 */

import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/public/HomePage';

// Auth pages
import LoginPage from '../pages/public/LoginPage';
import StudentRegistrationPage from '../pages/public/StudentRegistrationPage';
import TutorRegistrationPage from '../pages/public/TutorRegistrationPage';

// Role-based components
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { StudentLayout } from '@/Components/student/StudentLayout';
import { TutorLayout } from '@/Components/tutor/TutorLayout';

// Post components
import GlobalPostPage from '../pages/GlobalPostPage';
import TutorPostPage from '../pages/TutorPostPage';
import PostForm from '../Components/PostForm';
import PostDetail from '../Components/PostDetail';

// Home pages

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />

      {/* Authentication routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/student" element={<StudentRegistrationPage />} />
      <Route path="/register/tutor" element={<TutorRegistrationPage />} />

      {/* Protected Routes cho Student */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<div>Dashboard Student</div>} />
            <Route path="schedule" element={<div>Lịch học</div>} />
            <Route path="classes" element={<div>Lớp học của tôi</div>} />
            <Route path="assignments" element={<div>Bài tập</div>} />
            <Route path="documents" element={<div>Tài liệu</div>} />
            <Route path="statistics" element={<div>Thống kê</div>} />
            <Route path="settings" element={<div>Cài đặt</div>} />
            <Route path="posts" element={<GlobalPostPage />} />
          </Route>
        </Route>
      </Route>

      {/* Protected Routes cho Tutor */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['tutor']} />}>
          {/* TUTOR LAYOUT */}
          <Route path="/tutor" element={<TutorLayout />}>
            {/* ROUTE CON TRONG LAYOUT */}
            <Route index element={<div>Dashboard Tutor</div>} />
            <Route path="documents" element={<div>Tài liệu</div>} />
            <Route path="classes" element={<div>Lớp học của tôi</div>} />
            <Route path="students" element={<div>Quản lý học sinh</div>} />
            <Route path="assignments" element={<div>Bài tập</div>} />
            <Route path="statistics" element={<div>Thống kê</div>} />
            <Route path="settings" element={<div>Cài đặt</div>} />
            <Route path="posts" element={<TutorPostPage />} />
            <Route path="global-posts" element={<GlobalPostPage />} />
            <Route path="posts/new" element={<PostForm />} />
            <Route path="posts/:id/edit" element={<PostForm />} />
          </Route>
        </Route>
      </Route>

      {/* Post Detail - Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/posts/:id" element={<PostDetail />} />
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
