/**
 * File: pages/tutor/TutorLayout.tsx
 * Mục đích: Layout chính cho tutor
 * Structure: Header + Sidebar + Main content
 */

import { Outlet } from 'react-router-dom';
import { TutorSidebar } from '../../components/tutor/TutorSidebar';
import { TutorHeader } from '../../components/tutor/TutorHeader';

export function TutorLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header - Trên cùng */}
      <TutorHeader />

      {/* Main content - Dưới header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Trái */}
        <TutorSidebar />

        {/* Content area - Phải */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TutorLayout;
