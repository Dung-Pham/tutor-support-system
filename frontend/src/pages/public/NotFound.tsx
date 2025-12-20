import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Xác định trang chủ dựa vào role
  const getHomeUrl = () => {
    if (!isAuthenticated || !user) return '/';
    switch (user.role) {
      case 'tutor':
        return '/tutor';
      case 'student':
        return '/student';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy trang</h2>
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft size={18} />
            Quay lại
          </Button>
          <Link to={getHomeUrl()}>
            <Button className="gap-2 w-full sm:w-auto">
              <Home size={18} />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
