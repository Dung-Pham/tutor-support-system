import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Mail, Lock, User } from 'lucide-react';

const studentSchema = z
  .object({
    firstName: z.string().min(1, 'Tên là bắt buộc'),
    lastName: z.string().min(1, 'Họ là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
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
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };

      await apiClient.post('/auth/register/student', registrationData);

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Đăng ký tài khoản</h1>
          <p className="text-muted-foreground">
            Đăng ký để tìm gia sư phù hợp và bắt đầu hành trình học tập của bạn.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-md p-8 border border-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Last Name */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <User className="w-4 h-4 text-primary mr-2" />
                <label className="font-semibold">Họ</label>
              </div>
              <Input
                type="text"
                placeholder="Nguyễn"
                {...register('lastName')}
                className={`h-10 ${errors.lastName ? 'border-destructive' : ''}`}
              />
              {errors.lastName && (
                <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <User className="w-4 h-4 text-primary mr-2" />
                <label className="font-semibold">Tên</label>
              </div>
              <Input
                type="text"
                placeholder="Văn A"
                {...register('firstName')}
                className={`h-10 ${errors.firstName ? 'border-destructive' : ''}`}
              />
              {errors.firstName && (
                <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <Mail className="w-4 h-4 text-primary mr-2" />
                <label className="font-semibold">Địa chỉ Email</label>
              </div>
              <Input
                type="email"
                placeholder="example@gmail.com"
                {...register('email')}
                className={`h-10 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <Lock className="w-4 h-4 text-primary mr-2" />
                <label className="font-semibold">Mật khẩu</label>
              </div>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                {...register('password')}
                className={`h-10 ${errors.password ? 'border-destructive' : ''}`}
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <Lock className="w-4 h-4 text-primary mr-2" />
                <label className="font-semibold">Xác nhận mật khẩu</label>
              </div>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`h-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Display */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <BookOpen className="w-4 h-4 text-primary mr-2" />
                <span className="font-semibold">Vai trò:</span>
              </div>
              <div className="bg-secondary border border-border rounded-lg p-3">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-primary mr-3" />
                  <div>
                    <span className="font-semibold text-foreground">Học viên</span>
                    <p className="text-sm text-muted-foreground">Tìm gia sư và học tập</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full h-10 text-base">
              {isLoading ? '⏳ ĐANG TẠO TÀI KHOẢN...' : '✓ TẠO TÀI KHOẢN'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {/* Back to Role Selection */}
          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Quay lại chọn vai trò
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-card rounded-lg border border-border">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm text-muted-foreground">Tìm gia sư phù hợp</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border border-border">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-sm text-muted-foreground">Chat trực tiếp</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border border-border">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-sm text-muted-foreground">Theo dõi tiến độ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
