import { Outlet } from 'react-router-dom';
import Header from '@/components/public/GlobalHeader';
import Footer from '@/components/public/GlobalFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
