/**
 * File: pages/public/TutorRegistrationPage.tsx
 * Mục đích: Trang đăng ký dành cho gia sư (multi-step wizard)
 * Thiết kế: Form đăng ký phức tạp với nhiều bước
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

const tutorSchema = z
  .object({
    // Basic Info
    fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 chữ số'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),

    // Professional Info
    education: z.string().min(1, 'Trình độ học vấn là bắt buộc'),
    experience: z.string().min(1, 'Kinh nghiệm dạy học là bắt buộc'),
    subjects: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 môn học'),
    hourlyRate: z.number().min(50000, 'Giá tối thiểu là 50,000 VND/giờ'),
    bio: z.string().min(50, 'Giới thiệu bản thân phải có ít nhất 50 ký tự'),

    // Verification
    agreeTerms: z.boolean().refine((val) => val === true, 'Bạn phải đồng ý với điều khoản'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type TutorFormData = z.infer<typeof tutorSchema>;

const STEPS = [
  { id: 1, title: 'Thông tin cơ bản', icon: '👤' },
  { id: 2, title: 'Thông tin chuyên môn', icon: '🎓' },
  { id: 3, title: 'Hoàn tất đăng ký', icon: '✅' },
];

const SUBJECTS = [
  'Toán học',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Tiếng Anh',
  'Văn học',
  'Lịch sử',
  'Địa lý',
  'GDCD',
  'Tin học',
  'Tiếng Nhật',
  'Tiếng Trung',
  'Kinh tế',
  'Kế toán',
];

export default function TutorRegistrationPage(): JSX.Element {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      subjects: [],
      agreeTerms: false,
    },
  });

  const watchedSubjects = watch('subjects') || [];

  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step: number) => {
    switch (step) {
      case 1:
        return ['fullName', 'email', 'phone', 'password', 'confirmPassword'] as const;
      case 2:
        return ['education', 'experience', 'subjects', 'hourlyRate', 'bio'] as const;
      case 3:
        return ['agreeTerms'] as const;
      default:
        return [];
    }
  };

  const toggleSubject = (subject: string) => {
    const currentSubjects = watchedSubjects;
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];
    setValue('subjects', newSubjects);
  };

  const onSubmit = async (data: TutorFormData) => {
    try {
      setIsLoading(true);

      const registrationData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'tutor',
        tutorData: {
          education: data.education,
          experience: data.experience,
          subjects: data.subjects,
          hourlyRate: data.hourlyRate,
          bio: data.bio,
        },
      };

      await apiClient.post('/auth/register', registrationData);

      toast.success('Đăng ký thành công! Chúng tôi sẽ xem xét hồ sơ của bạn trong vòng 24-48 giờ.');
      reset();
      navigate('/registration-pending');
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
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Đăng ký làm gia sư</h1>
          <p className="text-white/90">
            Gia nhập cộng đồng gia sư và bắt đầu chia sẻ kiến thức của bạn.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    currentStep >= step.id ? 'bg-white text-purple-600' : 'bg-white/30 text-white'
                  } font-bold`}
                >
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <p className="text-white/90 text-sm">
              Bước {currentStep} / {STEPS.length}: {STEPS.find((s) => s.id === currentStep)?.title}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin cơ bản</h2>

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
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
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
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
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
              </div>
            )}

            {/* Step 2: Professional Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin chuyên môn</h2>

                {/* Education */}
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <span className="text-purple-600 mr-2">🎓</span>
                    <label className="font-semibold">Trình độ học vấn</label>
                  </div>
                  <select
                    {...register('education')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      errors.education ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn trình độ học vấn</option>
                    <option value="university">Đại học</option>
                    <option value="master">Thạc sĩ</option>
                    <option value="phd">Tiến sĩ</option>
                    <option value="college">Cao đẳng</option>
                  </select>
                  {errors.education && (
                    <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <span className="text-purple-600 mr-2">⏰</span>
                    <label className="font-semibold">Kinh nghiệm dạy học</label>
                  </div>
                  <select
                    {...register('experience')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      errors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn kinh nghiệm</option>
                    <option value="under-1-year">Dưới 1 năm</option>
                    <option value="1-2-years">1-2 năm</option>
                    <option value="3-5-years">3-5 năm</option>
                    <option value="over-5-years">Trên 5 năm</option>
                  </select>
                  {errors.experience && (
                    <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                  )}
                </div>

                {/* Subjects */}
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <span className="text-purple-600 mr-2">📚</span>
                    <label className="font-semibold">Môn học có thể dạy</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {SUBJECTS.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className={`p-3 border rounded-lg text-sm transition-colors ${
                          watchedSubjects.includes(subject)
                            ? 'bg-purple-100 border-purple-500 text-purple-700'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                  {errors.subjects && (
                    <p className="text-red-500 text-sm mt-1">{errors.subjects.message}</p>
                  )}
                </div>

                {/* Hourly Rate */}
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <span className="text-purple-600 mr-2">💰</span>
                    <label className="font-semibold">Giá dạy (VND/giờ)</label>
                  </div>
                  <input
                    type="number"
                    placeholder="100000"
                    min="50000"
                    step="10000"
                    {...register('hourlyRate', { valueAsNumber: true })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.hourlyRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.hourlyRate.message}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <span className="text-purple-600 mr-2">📝</span>
                    <label className="font-semibold">Giới thiệu bản thân</label>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Chia sẻ về kinh nghiệm, phương pháp dạy học và điểm mạnh của bạn..."
                    {...register('bio')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none ${
                      errors.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Hoàn tất đăng ký</h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-yellow-600 text-xl mr-3">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">Lưu ý quan trọng</h3>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        <li>• Hồ sơ của bạn sẽ được admin xem xét trong vòng 24-48 giờ</li>
                        <li>• Bạn sẽ nhận được email thông báo về kết quả xét duyệt</li>
                        <li>
                          • Trong thời gian chờ duyệt, bạn chưa thể sử dụng các tính năng gia sư
                        </li>
                        <li>• Vui lòng cung cấp thông tin chính xác để tăng tỷ lệ được duyệt</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Role Display */}
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <span className="text-purple-600 mr-2">👩‍🏫</span>
                    <span className="font-semibold">Vai trò:</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">👩‍🏫</span>
                      <div>
                        <span className="font-semibold text-purple-800 text-lg">Gia sư</span>
                        <p className="text-purple-600">Dạy học và chia sẻ kiến thức</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      {...register('agreeTerms')}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Tôi đồng ý với{' '}
                      <Link to="/terms" className="text-purple-600 hover:text-purple-800">
                        Điều khoản sử dụng
                      </Link>{' '}
                      và{' '}
                      <Link to="/privacy" className="text-purple-600 hover:text-purple-800">
                        Chính sách bảo mật
                      </Link>{' '}
                      của ứng dụng.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-red-500 text-sm mt-1">{errors.agreeTerms.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Quay lại
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${
                    currentStep === 1 ? 'ml-auto' : ''
                  }`}
                >
                  Tiếp tục →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ml-auto"
                >
                  {isLoading ? 'ĐANG ĐĂNG KÝ...' : 'HOÀN TẤT ĐĂNG KÝ'}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
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
      </div>
    </div>
  );
}
