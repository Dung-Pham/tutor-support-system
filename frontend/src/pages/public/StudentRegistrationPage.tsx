/**
 * File: pages/public/StudentRegistrationPage.tsx
 * Mục đích: Trang đăng ký dành cho học viên
 * Thiết kế: Form đăng ký với gradient background tương tự hình mẫu
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

const studentSchema = z
  .object({
    fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 chữ số'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentRegistrationPage(): JSX.Element {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsLoading(true);

      const registrationData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'student',
      };

      await apiClient.post('/auth/register', registrationData);

      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      reset();
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error', err);
      const message = err?.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Đăng ký tài khoản</h1>
          <p className="text-white/90">
            Đăng ký để tìm gia sư phù hợp và bắt đầu hành trình học tập của bạn.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <span className="text-purple-600 mr-2">👤</span>
                <label className="font-semibold">Họ và tên</label>
              </div>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                {...register('fullName')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <span className="text-purple-600 mr-2">📧</span>
                <label className="font-semibold">Địa chỉ Email</label>
              </div>
              <input
                type="email"
                placeholder="example@gmail.com"
                {...register('email')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <span className="text-purple-600 mr-2">📱</span>
                <label className="font-semibold">Số điện thoại</label>
              </div>
              <input
                type="tel"
                placeholder="0123456789"
                {...register('phone')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <span className="text-purple-600 mr-2">🔒</span>
                <label className="font-semibold">Mật khẩu</label>
              </div>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                {...register('password')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <span className="text-purple-600 mr-2">🔒</span>
                <label className="font-semibold">Xác nhận mật khẩu</label>
              </div>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                {...register('confirmPassword')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Display */}
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <span className="text-purple-600 mr-2">📚</span>
                <span className="font-semibold">Vai trò:</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📚</span>
                  <div>
                    <span className="font-semibold text-blue-800">Học viên</span>
                    <p className="text-sm text-blue-600">Tìm gia sư và học tập</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'ĐANG TẠO TÀI KHOẢN...' : 'TẠO TÀI KHOẢN'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {/* Back to Role Selection */}
          <div className="text-center mt-4">
            <Link to="/login" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Quay lại chọn vai trò
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-white">
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm">Tìm gia sư phù hợp</p>
            </div>
            <div>
              <div className="text-2xl mb-2">💬</div>
              <p className="text-sm">Chat trực tiếp</p>
            </div>
            <div>
              <div className="text-2xl mb-2">📈</div>
              <p className="text-sm">Theo dõi tiến độ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
