/**
 * File: components/Header.tsx
 * Header component with logo, user menu, and notifications
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { User, LogOut, Menu, X } from 'lucide-react';
import NotificationBell from './Notifications/NotificationBell';

interface HeaderProps {
  onTabChange?: (tab: string) => void;
}

export default function Header({ onTabChange }: HeaderProps = {}) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'tutor' || role === 'TUTOR' ? 'Gia su' : 'Hoc sinh';
  };

  const getBaseRoute = () => {
    const role = user?.role?.toUpperCase();
    return role === 'TUTOR' ? '/tutor' : '/student';
  };

  return (
    <header className=\"bg-white shadow-sm border-b border-gray-200\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
        <div className=\"flex justify-between items-center h-16\">
          {/* Logo */}
          <div className=\"flex items-center\">
            <Link to={getBaseRoute() + '/schedule'} className=\"flex items-center space-x-2\">
              <div className=\"w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center\">
                <span className=\"text-white font-bold text-sm\">TS</span>
              </div>
              <span className=\"text-xl font-semibold text-gray-900\">
                Ho tro Gia su
              </span>
            </Link>
          </div>

          {/* User Menu - Desktop */}
          <div className=\"hidden md:flex items-center space-x-4\">
            {/* Notification Bell from quynh */}
            {isAuthenticated && <NotificationBell onTabChange={onTabChange} />}
            
            <div className=\"flex items-center space-x-2\">
              <div className=\"w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center\">
                <User className=\"w-4 h-4 text-blue-600\" />
              </div>
              <div className=\"text-sm\">
                <p className=\"font-medium text-gray-900\">{user?.name}</p>
                <p className=\"text-gray-500\">{getRoleDisplayName(user?.role || '')}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className=\"flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors\"
            >
              <LogOut className=\"w-4 h-4\" />
              <span>Dang xuat</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className=\"md:hidden flex items-center space-x-2\">
            {isAuthenticated && <NotificationBell onTabChange={onTabChange} />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className=\"p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100\"
            >
              {isMenuOpen ? (
                <X className=\"w-6 h-6\" />
              ) : (
                <Menu className=\"w-6 h-6\" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className=\"md:hidden border-t border-gray-200 py-4\">
            <div className=\"flex items-center space-x-3 mb-4\">
              <div className=\"w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center\">
                <User className=\"w-5 h-5 text-blue-600\" />
              </div>
              <div>
                <p className=\"font-medium text-gray-900\">{user?.name}</p>
                <p className=\"text-sm text-gray-500\">{getRoleDisplayName(user?.role || '')}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className=\"flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors\"
            >
              <LogOut className=\"w-4 h-4\" />
              <span>Dang xuat</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
