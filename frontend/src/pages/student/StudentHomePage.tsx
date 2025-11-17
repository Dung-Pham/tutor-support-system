/**
 * File: pages/student/StudentHomePage.tsx
 * Mục đích: Trang chủ chính cho học viên
 * Tính năng:
 *   - Xem lịch học
 *   - Tìm kiếm gia sư
 *   - Quản lý lớp học đã đăng ký
 *   - Chat với gia sư
 */

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function StudentHomePage() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header cho Student */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Trang chủ Học viên</h1>
                <p className="text-gray-600">Chào mừng {user?.name}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-blue-700">
                  {user?.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">Xin chào, {user?.name}! 👋</h2>
          <p className="text-lg opacity-90">
            Hãy bắt đầu hành trình học tập của bạn với những gia sư xuất sắc nhất.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Tìm Gia sư</h3>
            <p className="text-gray-600 text-sm">Khám phá và tìm kiếm gia sư phù hợp</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Lịch học</h3>
            <p className="text-gray-600 text-sm">Xem lịch học và buổi học sắp tới</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Tin nhắn</h3>
            <p className="text-gray-600 text-sm">Chat với gia sư và nhận hỗ trợ</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Tiến độ</h3>
            <p className="text-gray-600 text-sm">Theo dõi kết quả học tập</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Classes */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Lớp học sắp tới</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 w-3 h-3 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Toán học cấp 3</h4>
                  <p className="text-sm text-gray-600">Thầy Nguyễn Văn A</p>
                  <p className="text-sm text-blue-600">Hôm nay, 14:00</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="bg-green-500 w-3 h-3 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Tiếng Anh</h4>
                  <p className="text-sm text-gray-600">Cô Trần Thị B</p>
                  <p className="text-sm text-green-600">Mai, 16:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Thống kê</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng số lớp</span>
                <span className="font-semibold text-gray-800">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hoàn thành</span>
                <span className="font-semibold text-green-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đang học</span>
                <span className="font-semibold text-blue-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Điểm TB</span>
                <span className="font-semibold text-purple-600">8.5</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
