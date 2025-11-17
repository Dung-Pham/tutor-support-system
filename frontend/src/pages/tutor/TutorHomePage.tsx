/**
 * File: pages/tutor/TutorHomePage.tsx
 * Mục đích: Trang chủ chính cho gia sư
 * Tính năng:
 *   - Quản lý lớp học
 *   - Xem lịch dạy
 *   - Chat với học viên
 *   - Thống kê thu nhập
 */

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function TutorHomePage() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header cho Tutor */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Trang chủ Gia sư</h1>
                <p className="text-gray-600">Chào mừng {user?.name}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-green-50 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-green-700">
                  {user?.role.toUpperCase()}
                </span>
              </div>
              <div className="bg-yellow-50 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-yellow-700">⭐ 4.8 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">Chào bạn, {user?.name}! 👨‍🏫</h2>
          <p className="text-lg opacity-90">
            Hôm nay là một ngày tuyệt vời để truyền cảm hứng cho học viên của bạn.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Học viên</h3>
            <p className="text-gray-600 text-sm">Quản lý học viên và lớp học</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Lịch dạy</h3>
            <p className="text-gray-600 text-sm">Xem và quản lý lịch giảng dạy</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Thu nhập</h3>
            <p className="text-gray-600 text-sm">Theo dõi thu nhập và thanh toán</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Báo cáo</h3>
            <p className="text-gray-600 text-sm">Xem báo cáo hiệu suất giảng dạy</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Schedule Today */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Lịch dạy hôm nay</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="bg-green-500 w-3 h-3 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Toán học - Lớp 12</h4>
                  <p className="text-sm text-gray-600">Học viên: Nguyễn Văn B</p>
                  <p className="text-sm text-green-600">14:00 - 15:30</p>
                </div>
                <button className="bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-green-700 text-sm transition-colors">
                  Bắt đầu
                </button>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 w-3 h-3 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Vật lý - Lớp 11</h4>
                  <p className="text-sm text-gray-600">Học viên: Trần Thị C</p>
                  <p className="text-sm text-blue-600">16:00 - 17:30</p>
                </div>
                <button className="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-700 text-sm transition-colors">
                  Chuẩn bị
                </button>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="bg-gray-400 w-3 h-3 rounded-full mr-4"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Hóa học - Lớp 10</h4>
                  <p className="text-sm text-gray-600">Học viên: Lê Văn D</p>
                  <p className="text-sm text-gray-600">19:00 - 20:30</p>
                </div>
                <span className="text-gray-500 text-sm">Tối nay</span>
              </div>
            </div>
          </div>

          {/* Stats & Summary */}
          <div className="space-y-6">
            {/* Monthly Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê tháng này</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng giờ dạy</span>
                  <span className="font-semibold text-gray-800">45h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số học viên</span>
                  <span className="font-semibold text-blue-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thu nhập</span>
                  <span className="font-semibold text-green-600">15,000,000đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đánh giá TB</span>
                  <span className="font-semibold text-yellow-600">4.8⭐</span>
                </div>
              </div>
            </div>

            {/* Quick Messages */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tin nhắn mới</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nguyễn Văn B</p>
                    <p className="text-xs text-gray-600">Thầy ơi, em có thể...</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Trần Thị C</p>
                    <p className="text-xs text-gray-600">Cảm ơn thầy về bài...</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                Xem tất cả tin nhắn
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
