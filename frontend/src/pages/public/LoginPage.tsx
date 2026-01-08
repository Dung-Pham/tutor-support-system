import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '../../store/slices/authSlice';
import type { RootState, AppDispatch } from '../../store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const baseRoute = user.role.toLowerCase() === 'tutor' ? '/tutor' : '/student';
      navigate(baseRoute);
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onInvalid = () => {
    // Form validation failed
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await dispatch(signIn({ email: data.email, password: data.password })).unwrap();
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      const errorMsg = typeof error === 'string' ? error : error?.message || 'Đăng nhập thất bại';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>Chào mừng bạn trở lại Hệ thống hỗ trợ gia sư</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    autoComplete="email"
                    {...register('email')}
                    placeholder="m@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Mật khẩu
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    {...register('password')}
                    placeholder="Nhập mật khẩu của bạn"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="text-sm">
                  <Link to="/register/student">📚 Đăng ký Học viên</Link>
                </Button>
                <Button asChild variant="outline" className="text-sm">
                  <Link to="/register/tutor">🎓 Đăng ký Gia sư</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-balance text-center text-xs text-muted-foreground mt-4 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{' '}
          <a href="#">Chính sách quyền riêng tư</a> của chúng tôi.
        </div>
      </div>
    </div>
  );
}
