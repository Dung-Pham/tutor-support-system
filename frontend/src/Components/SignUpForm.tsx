import React from 'react';
import { useForm } from 'node_modules/react-hook-form/dist';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupData = z.infer<typeof signupSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupData>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupData) => {
    try {
      await apiClient.post('/auth/signup', data);
      toast.success('Signup successful — you can now sign in');
      reset();
    } catch (err: any) {
      console.error('Signup error', err);
      const message = err?.response?.data?.message || 'Signup failed';
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
          <label className="block text-sm font-medium mb-1">First name</label>
          <input {...register('firstName')} className="w-full border px-3 py-2 rounded" />
          {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last name</label>
          <input {...register('lastName')} className="w-full border px-3 py-2 rounded" />
          {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input {...register('username')} className="w-full border px-3 py-2 rounded" />
          {errors.username && <p className="text-red-600 text-sm">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" {...register('email')} className="w-full border px-3 py-2 rounded" />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
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
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
