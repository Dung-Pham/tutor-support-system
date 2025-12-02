/**
 * File: pages/HomePage.tsx
 * Mục đích: Trang chủ với role selection trực tiếp
 * Vai trò:
 *   - Landing page cho toàn hệ thống
 *   - Quick access để login/register
 *   - Giới thiệu features
 */

import { Link } from 'react-router-dom';
import Header from '@/components/public/GlobalHeader';
import Footer from '@/components/public/GlobalFooter';

export default function HomePage() {
  // TODO: Auth logic disabled for UI development
  // const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Landing page for all users (auth temporarily disabled)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8">
        {/* Main Banner */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl p-12 text-center text-white mb-8">
          <h1 className="text-5xl font-bold mb-4">Gia Sư Online – Dạy Kèm Trực Tuyến</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Nền tảng kết nối gia sư online và tìm kiếm lớp dạy kèm trực tuyến dành cho phụ huynh và
            học sinh.
          </p>

          <div className="flex gap-4 justify-center max-w-md mx-auto">
            <Link
              to="/find-classes"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              TÌM LỚP DẠY KÈM
            </Link>
            <Link
              to="/register/tutor"
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              ĐĂNG KÝ LÀM GIA SƯ
            </Link>
          </div>
        </div>
        {/* Tutor Search Section */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-center text-white mb-6">Tìm Gia Sư</h2>
          <p className="text-center text-purple-100 mb-8">
            Tìm gia sư theo môn học, chương trình, khu vực, giới tính, và giờng nói.
          </p>

          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 mb-6">
              <input
                type="text"
                placeholder="Nhập tên hoặc mã gia sư..."
                className="w-full px-4 py-3 border-none outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <label className="block text-white font-medium mb-2">Môn học</label>
                <select className="w-full px-3 py-2 rounded border border-gray-300 text-gray-700">
                  <option>Tất cả môn học</option>
                  <option>Toán học</option>
                  <option>Vật lý</option>
                  <option>Hóa học</option>
                  <option>Tiếng Anh</option>
                  <option>Văn học</option>
                </select>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <label className="block text-white font-medium mb-2">Chương trình</label>
                <select className="w-full px-3 py-2 rounded border border-gray-300 text-gray-700">
                  <option>Tất cả chương trình</option>
                  <option>Tiểu học</option>
                  <option>THCS</option>
                  <option>THPT</option>
                  <option>Đại học</option>
                </select>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <label className="block text-white font-medium mb-2">Khu vực</label>
                <select className="w-full px-3 py-2 rounded border border-gray-300 text-gray-700">
                  <option>Tất cả khu vực</option>
                  <option>Hà Nội</option>
                  <option>TP.HCM</option>
                  <option>Đà Nẵng</option>
                  <option>Hải Phòng</option>
                </select>
              </div>
            </div>

            <div className="text-center mt-6">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                🔍 Tìm Kiếm Gia Sư
              </button>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {/* For Students */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4 text-center">📚</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Dành cho Học viên</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">✓ Tìm gia sư phù hợp với nhu cầu</li>
              <li className="flex items-center">✓ Đặt lịch học linh hoạt</li>
              <li className="flex items-center">✓ Chat và video call trực tiếp</li>
              <li className="flex items-center">✓ Theo dõi tiến độ học tập</li>
              <li className="flex items-center">✓ Thanh toán an toàn, minh bạch</li>
            </ul>
            <div className="mt-6 text-center">
              <Link
                to="/register/student"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>

          {/* For Tutors */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4 text-center">🎓</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Dành cho Gia sư</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">✓ Tạo profile gia sư chuyên nghiệp</li>
              <li className="flex items-center">✓ Quản lý học viên và lịch dạy</li>
              <li className="flex items-center">✓ Chia sẻ kiến thức qua blog</li>
              <li className="flex items-center">✓ Tăng thu nhập từ dạy học</li>
              <li className="flex items-center">✓ Tools dạy học hiện đại</li>
            </ul>
            <div className="mt-6 text-center">
              <Link
                to="/register/tutor"
                className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Gia nhập ngay
              </Link>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4 text-center">⭐</div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Tại sao chọn chúng tôi?
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">✓ Gia sư được verify kỹ lưỡng</li>
              <li className="flex items-center">✓ Nền tảng an toàn, bảo mật</li>
              <li className="flex items-center">✓ Hỗ trợ 24/7</li>
              <li className="flex items-center">✓ Công nghệ hiện đại</li>
              <li className="flex items-center">✓ Cộng đồng học tập sôi động</li>
            </ul>
            <div className="mt-6 text-center">
              <Link
                to="/about"
                className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>{' '}
        {/* Stats */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-12 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-8">Con số ấn tượng</h2>
          <div className="grid grid-cols-4 gap-8">
            <div className="bg-white/20 rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-white/90 font-medium">Học viên</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/90 font-medium">Gia sư</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white/90 font-medium">Buổi học</div>
            </div>
            <div className="bg-white/20 rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-white/90 font-medium">Đánh giá</div>
            </div>
          </div>
        </div>
        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 text-gray-600">
            Tham gia cùng hàng ngàn học viên và gia sư đã tin tưởng chúng tôi
          </p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:from-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            BẮT ĐẦU NGAY HÔM NAY
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
