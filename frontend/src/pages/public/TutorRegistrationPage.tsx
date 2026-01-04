import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock } from 'lucide-react';

const tutorSchema = z
  .object({
    name: z.string().min(1, 'Họ và tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type TutorFormData = z.infer<typeof tutorSchema>;

export default function TutorRegistrationPage(): JSX.Element {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
  });

  const onSubmit = async (data: TutorFormData) => {
    try {
      setIsLoading(true);

      const registrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      await apiClient.post('/auth/register/tutor', registrationData);

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
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Đăng ký làm gia sư</h1>
          <p className="text-muted-foreground">
            Gia nhập cộng đồng gia sư và bắt đầu chia sẻ kiến thức của bạn.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-md p-8 border border-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <User className="w-4 h-4 text-primary mr-2" />
                <label className="font-semibold">Họ và tên</label>
              </div>
              <Input
                type="text"
                placeholder="Nguyễn Văn A"
                {...register('name')}
                className={`h-10 ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center text-foreground mb-2">
                <Mail className="w-4 h-4 text-primary mr-2" />
                <label className="font-semibold">Email</label>
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

            <Button type="submit" disabled={isLoading} className="w-full h-10 text-base">
              {isLoading ? '⏳ Đang xử lý...' : '✓ Đăng ký'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-border">
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
              to="/"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Quay lại chọn vai trò
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
