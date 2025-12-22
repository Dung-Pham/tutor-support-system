import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Send,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Shield,
  Award,
} from 'lucide-react';

export default function GlobalFooter() {
  const footerLinks = {
    services: [
      { name: 'Tìm gia sư', href: '/find-tutors', icon: Users },
      { name: 'Đăng ký lớp học', href: '/register-class', icon: BookOpen },
      { name: 'Tư vấn học tập', href: '/consulting', icon: HelpCircle },
      { name: 'Bài viết', href: '/posts', icon: FileText },
    ],
    company: [
      { name: 'Về chúng tôi', href: '/about' },
      { name: 'Đội ngũ', href: '/team' },
      { name: 'Tuyển dụng', href: '/careers' },
      { name: 'Liên hệ', href: '/contact' },
    ],
    support: [
      { name: 'Trung tâm hỗ trợ', href: '/help' },
      { name: 'Câu hỏi thường gặp', href: '/faq' },
      { name: 'Điều khoản sử dụng', href: '/terms' },
      { name: 'Chính sách bảo mật', href: '/privacy' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg',
      href: '#',
    },
    { name: 'YouTube', icon: 'https://www.svgrepo.com/show/13671/youtube.svg', href: '#' },
    { name: 'TikTok', icon: 'https://www.svgrepo.com/show/452114/tiktok.svg', href: '#' },
    {
      name: 'Zalo',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg',
      href: '#',
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 mt-12">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">Đăng ký nhận tin tức</h3>
              <p className="text-blue-100">Cập nhật thông tin mới nhất về gia sư và khóa học</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn..."
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 min-w-[250px]"
              />
              <Button className="bg-white text-blue-600 hover:bg-gray-100 gap-2 px-6">
                <Send size={16} />
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <GraduationCap className="text-white" size={26} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">GS</span>
                </div>
              </div>
              <div>
                <span className="font-bold text-xl text-white">GiaSuOnline</span>
                <p className="text-xs text-gray-400">Học tập - Kết nối - Thành công</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Nền tảng kết nối gia sư và học viên hàng đầu Việt Nam. Chúng tôi cam kết mang đến trải
              nghiệm học tập tốt nhất.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:1900xxxx"
                className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Phone size={16} className="text-blue-400" />
                </div>
                <span>Hotline: 1900 xxxx</span>
              </a>
              <a
                href="mailto:support@giasuonline.vn"
                className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Mail size={16} className="text-blue-400" />
                </div>
                <span>support@giasuonline.vn</span>
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
                  <MapPin size={16} className="text-blue-400" />
                </div>
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-400" />
              Dịch vụ
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <link.icon size={14} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Award size={18} className="text-purple-400" />
              Công ty
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={18} className="text-green-400" />
              Hỗ trợ
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} GiaSuOnline. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm mr-2">Theo dõi chúng tôi:</span>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110"
              >
                <img src={social.icon} alt={social.name} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-500" />
              <span>Bảo mật SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-yellow-500" />
              <span>Gia sư chất lượng</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-blue-500" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
