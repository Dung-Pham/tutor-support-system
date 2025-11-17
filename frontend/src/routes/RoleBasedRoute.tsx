/**
 * File: routes/RoleBasedRoute.tsx
 * Mục đích: Component kiểm soát truy cập dựa trên role
 * Vai trò:
 *   - Check user role và cho phép/từ chối truy cập
 *   - Redirect về trang phù hợp nếu không đúng role
 *   - Hỗ trợ multiple roles cho một route
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface RoleBasedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleBasedRoute = ({
  allowedRoles,
  redirectTo = '/unauthorized',
}: RoleBasedRouteProps) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không có user data
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role có được phép không
  if (!allowedRoles.includes(user.role)) {
    // Redirect theo role thực tế của user
    const userRoleRedirect = getRoleDefaultRoute(user.role);
    return <Navigate to={userRoleRedirect || redirectTo} replace />;
  }

  return <Outlet />;
};

/**
 * Helper function để lấy route mặc định theo role
 */
export const getRoleDefaultRoute = (role: string): string => {
  switch (role) {
    case 'tutor':
      return '/tutor/';
    case 'student':
      return '/student/';
    default:
      return '/';
  }
};

/**
 * Hook để redirect user về homepage của họ
 */
export const useRoleRedirect = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return () => {
    if (user) {
      return getRoleDefaultRoute(user.role);
    }
    return '/';
  };
};
