/**
 * File: Components/layout/Header.tsx
 * Purpose: Desktop-only header design
 * Features:
 *   - Clean white background with subtle shadows
 *   - Professional navigation
 *   - Desktop-optimized layout
 *   - User authentication state integration
 */

import { Link } from 'react-router-dom';

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  // TODO: Auth logic disabled for UI development
  // const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const headerClass =
    variant === 'transparent'
      ? 'absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50'
      : 'bg-white shadow-sm border-b border-gray-200';

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Search Icon */}
          <div className="flex items-center">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-0">
            <Link
              to="/dich-vu-gia-su"
              className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors uppercase tracking-wide"
            >
              DỊCH VỤ GIA SƯ
              <svg className="w-3 h-3 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              to="/phu-huynh"
              className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors uppercase tracking-wide"
            >
              PHỤ HUYNH
              <svg className="w-3 h-3 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              to="/gia-su"
              className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors uppercase tracking-wide"
            >
              GIA SƯ
              <svg className="w-3 h-3 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              to="/danh-sach-gia-su"
              className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors uppercase tracking-wide"
            >
              DANH SÁCH GIA SƯ
            </Link>

            <Link
              to="/danh-sach-lop-moi"
              className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors uppercase tracking-wide"
            >
              DANH SÁCH LỚP MỚI
            </Link>

            <Link
              to="/tin-tuc"
              className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors uppercase tracking-wide"
            >
              TIN TỨC
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {/* Auth temporarily disabled - always show login buttons */}
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                ĐĂNG NHẬP
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors border-l border-gray-300 pl-4"
              >
                ĐĂNG KÝ
              </Link>
            </>
          </div>
        </div>
      </div>
    </header>
  );
}
