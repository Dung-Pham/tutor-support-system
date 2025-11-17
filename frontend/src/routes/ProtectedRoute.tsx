/**
 * File: routes/ProtectedRoute.tsx
 * Mục đích: Component bảo vệ routes cần authentication
 * Vai trò:
 *   - Check user đã đăng nhập chưa
 *   - Redirect về login nếu chưa auth
 *   - Render children nếu đã auth
 * Sử dụng:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // TODO: Có thể thêm loading state khi check auth
  // const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  // if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
