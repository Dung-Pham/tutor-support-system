/**
 * File: components/ProtectedRoute.tsx
 * Mục đích: Component bảo vệ routes yêu cầu authentication
 * Vai trò:
 *   - Kiểm tra trạng thái authentication
 *   - Redirect đến /login nếu chưa đăng nhập
 *   - Có thể kiểm tra role nếu cần
 */

import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'USER' | 'TUTOR';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Nếu chưa đăng nhập, redirect đến login với return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu role và user không có role phù hợp
  if (role && user?.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-4">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <p className="text-sm text-gray-500">
            Yêu cầu: {role === 'TUTOR' ? 'Gia sư' : 'Học sinh'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
