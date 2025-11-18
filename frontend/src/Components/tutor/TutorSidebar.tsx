import {
  Home,
  List,
  BookOpen,
  FolderOpen,
  Users,
  Settings,
  ChevronDown,
  User,
  AlertCircle,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

interface SidebarProps {
  userName?: string;
}

export default function Sidebar({ userName = 'Dang Le Hai' }: SidebarProps) {
  const [isPolicyExpanded, setIsPolicyExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200 text-center">
        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
          <User className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">{userName}</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          TẤT THÔNG BÁO
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/tutor"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Quản lý chung</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/classes"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <List className="w-5 h-5 text-blue-600" />
              <span>Danh sách lớp mới</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/classes"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Quản lý lớp</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/documents"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <FolderOpen className="w-5 h-5" />
              <span>Thư viện tài liệu</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/students"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Giới thiệu gia sư</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/assignments"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Bài tập</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/statistics"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Thống kê</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/global-posts"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Bài viết chung</span>
            </Link>
          </li>

          <li>
            <Link
              to="/tutor/posts"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Bài viết của tôi</span>
            </Link>
          </li>

          {/* Chính sách & điều khoản - Expandable */}
          <li>
            <button
              onClick={() => setIsPolicyExpanded(!isPolicyExpanded)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5" />
                <span>Chính sách & điều khoản</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isPolicyExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isPolicyExpanded && (
              <ul className="ml-8 mt-2 space-y-1">
                <li>
                  <Link
                    to="/tutor"
                    className="block p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                  >
                    Chính sách & điều khoản chung
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tutor"
                    className="block p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                  >
                    Hợp đồng kết nối gia sư
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Cài đặt - Expandable */}
          <li>
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5" />
                <span>Cài đặt</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isSettingsExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isSettingsExpanded && (
              <ul className="ml-8 mt-2 space-y-1">
                <li>
                  <Link
                    to="/tutor/settings"
                    className="block p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                  >
                    Cài đặt tài khoản
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tutor/settings"
                    className="block p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                  >
                    Cài đặt thông báo
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
