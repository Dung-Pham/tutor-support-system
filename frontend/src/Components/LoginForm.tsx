import React from 'react';
import { useForm } from 'node_modules/react-hook-form/dist';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

const LoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof LoginSchema>;

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormInputs>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const res = await apiClient.post('/auth/signin', data);
      const token = res?.data?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
      }
      toast.success(res?.data?.message || 'Signed in successfully');
      reset();
      // redirect to home
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error', err);
      const message = err?.response?.data?.message || 'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className={className} {...props}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow space-y-3"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input {...register('username')} className="w-full border px-3 py-2 rounded" />
          {errors.username && <p className="text-red-600 text-sm">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
