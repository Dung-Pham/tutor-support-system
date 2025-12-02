/**
 * File: pages/public/RoleSelectionPage.tsx
 * Mục đích: Trang chọn role để đăng ký (Student/Tutor)
 * Thiết kế: Nền trắng với header/footer có màu
 */

import { Link } from 'react-router-dom';
import Header from '@/components/public/GlobalHeader';
import Footer from '@/components/public/GlobalFooter';
// shadcn-style UI components (assumes components exported under src/components/ui)
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RoleSelectionPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
            <span className="text-3xl text-white">🚀</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Chọn vai trò của bạn
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tham gia GiaSuOnline.vn với vai trò phù hợp để bắt đầu hành trình học tập của bạn
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Card */}
          <Link
            to="/register/student"
            className="group bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                📚
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Tôi là Học viên</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Tìm kiếm gia sư chất lượng để cải thiện kết quả học tập. Đăng ký dễ dàng và bắt đầu
                học ngay.
              </p>

              <ul className="text-left space-y-3 mb-8 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3 text-lg">✓</span>
                  Tìm gia sư phù hợp với nhu cầu
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3 text-lg">✓</span>
                  Đặt lịch học linh hoạt
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3 text-lg">✓</span>
                  Thanh toán an toàn, minh bạch
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3 text-lg">✓</span>
                  Theo dõi tiến độ học tập
                </li>
              </ul>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                Đăng ký làm Học viên →
              </div>
            </div>
          </Link>

          {/* Tutor Card (shadcn Card) */}
          <Link to="/register/tutor" className="group">
            <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-100">
              <CardHeader className="text-center p-8">
                <div className="text-6xl mb-4">🎓</div>
                <CardTitle className="text-3xl font-bold">Tôi là Gia sư</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Chia sẻ kiến thức và kiếm thu nhập ổn định từ việc dạy học. Yêu cầu xét duyệt để
                  đảm bảo chất lượng.
                </p>
                <ul className="text-left space-y-3 mb-6 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span> Tạo hồ sơ gia sư chuyên nghiệp
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span> Quản lý học viên và lịch dạy
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span> Nhận lương cao, ổn định
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span> Công cụ dạy học hiện đại
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-6 text-center">
                <Button asChild variant="ghost" className="w-full">
                  <div>Đăng ký làm Gia sư →</div>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Đã có tài khoản?</p>
          <Link
            to="/login"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
