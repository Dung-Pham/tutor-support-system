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

// Student pages
import { StudentLayout } from '@/pages/student/StudentLayout';
import StudentMessages from '@/pages/student/StudentMessages';

// Tutor pages
import { TutorLayout } from '@/pages/tutor/TutorLayout';
import TutorPosts from '@/pages/tutor/TutorPosts';
import CreatePost from '@/pages/tutor/CreatePost';
import MyPosts from '@/pages/tutor/MyPosts';
import TutorMessages from '@/pages/tutor/TutorMessages';
import TutorStudents from '@/pages/tutor/TutorStudents';
import TutorSchedule from '@/pages/tutor/TutorSchedule';
import TutorStatistics from '@/pages/tutor/TutorStatistics';
import TutorSettings from '@/pages/tutor/TutorSettings';

// Role-based components
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

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
            <Route path="messages" element={<StudentMessages />} />
            <Route path="statistics" element={<div>Thống kê</div>} />
            <Route path="settings" element={<div>Cài đặt</div>} />
          </Route>
        </Route>
      </Route>

      {/* Protected Routes cho Tutor */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['tutor']} />}>
          <Route path="/tutor" element={<TutorLayout />}>
            <Route index element={<TutorPosts />} />
            <Route path="posts" element={<TutorPosts />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="messages" element={<TutorMessages />} />
            <Route path="students" element={<TutorStudents />} />
            <Route path="schedule" element={<TutorSchedule />} />
            <Route path="statistics" element={<TutorStatistics />} />
            <Route path="settings" element={<TutorSettings />} />
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
