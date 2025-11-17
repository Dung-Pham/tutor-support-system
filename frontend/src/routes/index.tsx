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

// Home pages
import StudentHomePage from '../pages/student/StudentHomePage';
import TutorHomePage from '../pages/tutor/TutorHomePage';

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
          <Route path="/student/" element={<StudentHomePage />} />
          {/* Thêm các routes khác cho student ở đây */}
        </Route>
      </Route>

      {/* Protected Routes cho Tutor */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['tutor']} />}>
          <Route path="/tutor/" element={<TutorHomePage />} />
          {/* Thêm các routes khác cho tutor ở đây */}
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
