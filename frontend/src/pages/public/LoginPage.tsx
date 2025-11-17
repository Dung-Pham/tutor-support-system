/**
 * File: pages/public/LoginPage.tsx
 * Mục đích: Trang đăng nhập thống nhất với thiết kế đẹp
 * Thiết kế: Nền trắng với header/footer có màu
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { getBaseRouteByRole } from '@/routes/routeConstants';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Mock login for testing
      console.log('Login attempt:', data);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login response
      const mockUser = {
        id: '1',
        name: 'Dang Le Hai',
        email: data.email,
        role: 'tutor', // Change this to 'admin', 'student', etc. for testing
      };

      const mockToken = 'mock-jwt-token';

      // Store credentials in Redux
      dispatch(setCredentials({ user: mockUser, token: mockToken }));

      // Store token in localStorage if remember me is checked
      if (data.rememberMe) {
        localStorage.setItem('token', mockToken);
      }

      toast.success(`Chào mừng ${mockUser.name}!`);

      // Role-based redirect
      const redirectPath = getBaseRouteByRole(mockUser.role);
      navigate(redirectPath); // TODO: Replace with actual API call
      /*
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        // ... rest of the logic
      }
      */
    } catch (err: any) {
      console.error('Login error', err);
      const message = err?.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
              <span className="text-2xl text-white">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
            <p className="text-gray-600">Chào mừng bạn trở lại GiaSuOnline.vn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                placeholder="Nhập email của bạn"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                placeholder="Nhập mật khẩu của bạn"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? '🔄 Đang đăng nhập...' : '🚀 Đăng nhập'}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Quick Register Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/register/student"
                className="text-center py-2 px-3 border border-blue-300 text-blue-700 rounded-lg text-sm hover:bg-blue-50 transition-colors"
              >
                📚 Đăng ký Học viên
              </Link>
              <Link
                to="/register/tutor"
                className="text-center py-2 px-3 border border-green-300 text-green-700 rounded-lg text-sm hover:bg-green-50 transition-colors"
              >
                🎓 Đăng ký Gia sư
              </Link>
            </div>
          </form>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
