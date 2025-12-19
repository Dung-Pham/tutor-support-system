import { Link } from 'react-router-dom';
import Header from '@/components/public/GlobalHeader';
import Footer from '@/components/public/GlobalFooter';

export default function TutorPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg">
          <div className="text-8xl mb-6">⏳</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Chờ phê duyệt</h1>
          <div className="space-y-4 text-gray-600 mb-8">
            <p className="text-lg">Hồ sơ gia sư của bạn đang được xem xét bởi đội ngũ quản trị.</p>
            <p>Chúng tôi sẽ gửi thông báo qua email và SMS khi có kết quả phê duyệt.</p>
            <p className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
              <strong>Lưu ý:</strong> Quá trình phê duyệt thường mất 1-3 ngày làm việc.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Về trang chủ
            </Link>
            <Link
              to="/tutor/profile"
              className="block border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Chỉnh sửa hồ sơ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
