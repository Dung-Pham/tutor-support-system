/**
 * File: components/layout/AdminLayout.tsx
 * Purpose: Admin dashboard layout wrapper
 */

import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
        <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
