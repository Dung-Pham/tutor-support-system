/**
 * File: Components/layout/Footer.tsx
 * Purpose: Reusable footer component with giasuonline.vn styling
 * Features:
 *   - Gradient purple background matching header
 *   - 4-column layout with links
 *   - Social media icons
 *   - Copyright information
 */

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Về chúng tôi</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  📄 Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  💼 Tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  📞 Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/partnership"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  🤝 Hợp tác
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Dịch vụ</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/find-tutors"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  🔍 Tìm gia sư
                </Link>
              </li>
              <li>
                <Link
                  to="/subjects"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  📚 Môn học
                </Link>
              </li>
              <li>
                <Link
                  to="/online-classes"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  💻 Lớp học online
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  📝 Blog giáo dục
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/help"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  ❓ Trợ giúp
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  💡 FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  🎧 Hỗ trợ khách hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  📋 Hướng dẫn sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Pháp lý & Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/terms"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  📜 Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  🔒 Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-purple-200 hover:text-white transition-colors flex items-center"
                >
                  🍪 Chính sách Cookie
                </Link>
              </li>
              <li>
                <div className="text-purple-200">📧 support@giasuonline.vn</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-purple-500 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-purple-200 text-sm mb-4 lg:mb-0 text-center lg:text-left">
              © 2025 GiaSuOnline.vn - Nền tảng gia sư trực tuyến hàng đầu Việt Nam
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              <Link
                to="https://facebook.com/giasuonline"
                target="_blank"
                className="text-purple-200 hover:text-white transition-colors flex items-center space-x-2"
              >
                <span className="text-lg">📘</span>
                <span className="hidden sm:block">Facebook</span>
              </Link>
              <Link
                to="https://zalo.me/giasuonline"
                target="_blank"
                className="text-purple-200 hover:text-white transition-colors flex items-center space-x-2"
              >
                <span className="text-lg">💬</span>
                <span className="hidden sm:block">Zalo</span>
              </Link>
              <Link
                to="mailto:support@giasuonline.vn"
                className="text-purple-200 hover:text-white transition-colors flex items-center space-x-2"
              >
                <span className="text-lg">📧</span>
                <span className="hidden sm:block">Email</span>
              </Link>
              <Link
                to="tel:+84123456789"
                className="text-purple-200 hover:text-white transition-colors flex items-center space-x-2"
              >
                <span className="text-lg">📞</span>
                <span className="hidden sm:block">Hotline</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
