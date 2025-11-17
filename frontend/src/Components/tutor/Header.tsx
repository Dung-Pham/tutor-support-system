/**
 * File: components/tutor/Header.tsx
 * Purpose: Header component riêng cho tutor dashboard
 * Features:
 *   - Blue header background
 *   - User profile info on the right
 *   - Notification icon
 *   - No logo (tutor specific)
 */

import { Bell, User } from 'lucide-react';

interface TutorHeaderProps {
  userName?: string;
}

export default function TutorHeader({ userName = 'Dang Le Hai' }: TutorHeaderProps) {
  return (
    <header className="bg-blue-700 text-white h-16 flex items-center justify-end px-6 shadow-lg">
      {/* User Info & Notification */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button className="relative p-2 hover:bg-blue-600 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <span className="text-sm font-medium">{userName}</span>

          {/* Hamburger menu */}
          <button className="p-1 hover:bg-blue-600 rounded transition-colors">
            <div className="space-y-1">
              <div className="w-4 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-white"></div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
