import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/public/GlobalHeader';
import Footer from '@/components/public/GlobalFooter';
import { PostCard } from '@/components/post/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookOpen,
  Users,
  Search,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import * as postService from '@/services/postService';
import type { Post } from '@/types/post';

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const response = await postService.getApprovedPosts(1, 6);
        setLatestPosts(response.data || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchLatestPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Main Banner - Improved gradient & animation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-pink-300 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              🎓 Nền tảng học tập trực tuyến #1 Việt Nam
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Gia Sư Online
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Dạy Kèm Trực Tuyến
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/90">
              Kết nối gia sư chất lượng với học viên mọi nơi. Học tập linh hoạt, hiệu quả và tiết
              kiệm.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/find-classes"
                className="group bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <BookOpen size={20} />
                TÌM LỚP DẠY KÈM
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register/tutor"
                className="group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <Users size={20} />
                ĐĂNG KÝ LÀM GIA SƯ
              </Link>
            </div>
          </div>
        </div>
        {/* Tutor Search Section - Improved */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-4">
                <Search size={16} />
                Tìm kiếm nhanh
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Tìm Gia Sư Phù Hợp</h2>
              <p className="text-purple-100 max-w-xl mx-auto">
                Tìm gia sư theo môn học, chương trình và khu vực phù hợp với bạn
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-2 mb-6 shadow-lg flex items-center gap-2">
                <Search className="ml-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Nhập tên hoặc mã gia sư..."
                  className="flex-1 px-4 py-3 border-none outline-none text-gray-700 placeholder-gray-400"
                />
                <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg">
                  Tìm kiếm
                </button>
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <label className="block text-white font-medium mb-2 text-sm">📚 Môn học</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border-0 text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-purple-400">
                    <option>Tất cả môn học</option>
                    <option>Toán học</option>
                    <option>Vật lý</option>
                    <option>Hóa học</option>
                    <option>Tiếng Anh</option>
                    <option>Văn học</option>
                  </select>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <label className="block text-white font-medium mb-2 text-sm">
                    🎓 Chương trình
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-lg border-0 text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-purple-400">
                    <option>Tất cả chương trình</option>
                    <option>Tiểu học</option>
                    <option>THCS</option>
                    <option>THPT</option>
                    <option>Đại học</option>
                  </select>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <label className="block text-white font-medium mb-2 text-sm">📍 Khu vực</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border-0 text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-purple-400">
                    <option>Tất cả khu vực</option>
                    <option>Hà Nội</option>
                    <option>TP.HCM</option>
                    <option>Đà Nẵng</option>
                    <option>Hải Phòng</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Features Section - Improved */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* For Students */}
          <div className="group bg-white rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
              <BookOpen className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Dành cho Học viên</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" /> Tìm gia sư phù
                hợp với nhu cầu
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" /> Đặt lịch học linh
                hoạt
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" /> Chat và video
                call trực tiếp
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" /> Theo dõi tiến độ
                học tập
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" /> Thanh toán an
                toàn, minh bạch
              </li>
            </ul>
            <div className="mt-8 text-center">
              <Link
                to="/register/student"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>

          {/* For Tutors */}
          <div className="group bg-white rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
              <GraduationCap className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Dành cho Gia sư</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> Tạo profile gia
                sư chuyên nghiệp
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> Quản lý học viên
                và lịch dạy
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> Chia sẻ kiến
                thức qua blog
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> Tăng thu nhập từ
                dạy học
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> Tools dạy học
                hiện đại
              </li>
            </ul>
            <div className="mt-8 text-center">
              <Link
                to="/register/tutor"
                className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Gia nhập ngay
              </Link>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="group bg-white rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
              <MessageSquare className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Tại sao chọn chúng tôi?
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-purple-500 flex-shrink-0" /> Gia sư được
                verify kỹ lưỡng
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-purple-500 flex-shrink-0" /> Nền tảng an
                toàn, bảo mật
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-purple-500 flex-shrink-0" /> Hỗ trợ 24/7
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-purple-500 flex-shrink-0" /> Công nghệ hiện
                đại
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-purple-500 flex-shrink-0" /> Cộng đồng học
                tập sôi động
              </li>
            </ul>
            <div className="mt-8 text-center">
              <Link
                to="/about"
                className="inline-block bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
        {/* Latest Posts Section - NEW */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                📝 Bài viết mới nhất
              </h2>
              <p className="text-gray-500">Khám phá kiến thức và kinh nghiệm từ cộng đồng gia sư</p>
            </div>
            <Link
              to="/posts"
              className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Xem tất cả
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <PostCard key={post._id} post={post} isCommunity />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">Chưa có bài viết nào</p>
            </div>
          )}

          {latestPosts.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/posts">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Xem thêm bài viết
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats - Improved */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-48 h-48 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-10">Con số ấn tượng</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors">
                <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
                <div className="text-white/90 font-medium">Học viên</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors">
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-white/90 font-medium">Gia sư</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors">
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-white/90 font-medium">Buổi học</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors">
                <div className="text-4xl md:text-5xl font-bold mb-2">4.8/5</div>
                <div className="text-white/90 font-medium">Đánh giá</div>
              </div>
            </div>
          </div>
        </div>
        {/* CTA Section - Improved */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl p-10 md:p-14 text-center border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-purple-50 opacity-50" />
          <div className="relative z-10">
            <span className="inline-block text-5xl mb-4">🚀</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Sẵn sàng bắt đầu?</h2>
            <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-xl mx-auto">
              Tham gia cùng hàng ngàn học viên và gia sư đã tin tưởng chúng tôi
            </p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:from-pink-600 hover:via-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              BẮT ĐẦU NGAY HÔM NAY
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
