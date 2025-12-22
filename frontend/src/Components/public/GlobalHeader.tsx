import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  GraduationCap,
  Users,
  BookOpen,
  Search,
  Newspaper,
  Menu,
  ChevronRight,
  UserPlus,
  LogIn,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerClass =
    variant === 'transparent'
      ? 'absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50'
      : 'sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100';

  const navigationItems = [
    {
      title: 'Dịch vụ',
      icon: BookOpen,
      items: [
        { name: 'Tìm gia sư', href: '/find-tutors', description: 'Tìm gia sư phù hợp với nhu cầu' },
        { name: 'Đăng ký lớp', href: '/register-class', description: 'Đăng ký lớp học mới' },
        { name: 'Tư vấn học tập', href: '/consulting', description: 'Nhận tư vấn từ chuyên gia' },
      ],
    },
    {
      title: 'Gia sư',
      icon: GraduationCap,
      items: [
        { name: 'Danh sách gia sư', href: '/tutors', description: 'Xem tất cả gia sư' },
        {
          name: 'Gia sư nổi bật',
          href: '/top-tutors',
          description: 'Top gia sư được đánh giá cao',
        },
        {
          name: 'Đăng ký làm gia sư',
          href: '/register/tutor',
          description: 'Gia nhập đội ngũ gia sư',
        },
      ],
    },
    {
      title: 'Học viên',
      icon: Users,
      items: [
        { name: 'Tìm lớp học', href: '/find-classes', description: 'Tìm lớp phù hợp' },
        { name: 'Lịch học của tôi', href: '/my-schedule', description: 'Quản lý lịch học' },
        { name: 'Đăng ký học viên', href: '/register/student', description: 'Tham gia học tập' },
      ],
    },
    {
      title: 'Lớp mới',
      icon: Search,
      href: '/new-classes',
    },
    {
      title: 'Bài viết',
      icon: Newspaper,
      href: '/posts',
    },
  ];

  return (
    <header className={headerClass}>
      {/* Top bar - contact info */}
      <div className="hidden lg:block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="tel:1900xxxx"
              className="flex items-center gap-1.5 hover:text-blue-200 transition-colors"
            >
              <Phone size={14} />
              <span>Hotline: 1900 xxxx</span>
            </a>
            <a
              href="mailto:support@giasuonline.vn"
              className="flex items-center gap-1.5 hover:text-blue-200 transition-colors"
            >
              <Mail size={14} />
              <span>support@giasuonline.vn</span>
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>Hà Nội, Việt Nam</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="text-white" size={22} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">GS</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GiaSuOnline
              </span>
              <span className="text-[10px] text-gray-500 -mt-1">
                Học tập - Kết nối - Thành công
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 data-[state=open]:bg-gray-100 px-3 py-2 rounded-lg">
                          <item.icon size={16} className="mr-1.5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">{item.title}</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-2 p-4">
                            {item.items.map((subItem) => (
                              <li key={subItem.name}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={subItem.href}
                                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                                      <ChevronRight size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {subItem.name}
                                      </div>
                                      <p className="text-sm text-gray-500">{subItem.description}</p>
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link
                        to={item.href!}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <item.icon size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">{item.title}</span>
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-600 hover:text-blue-600"
                asChild
              >
                <Link to="/login">
                  <LogIn size={16} />
                  <span>Đăng nhập</span>
                </Link>
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                asChild
              >
                <Link to="/register">
                  <UserPlus size={16} />
                  <span>Đăng ký</span>
                </Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="text-white" size={18} />
                    </div>
                    GiaSuOnline
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigationItems.map((item) => (
                    <div key={item.title}>
                      {item.items ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-900">
                            <item.icon size={16} className="text-blue-600" />
                            {item.title}
                          </div>
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 px-6 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <ChevronRight size={14} />
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link
                          to={item.href!}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <item.icon size={16} className="text-blue-600" />
                          {item.title}
                        </Link>
                      )}
                    </div>
                  ))}
                  <div className="pt-4 border-t mt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2" asChild>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <LogIn size={16} />
                        Đăng nhập
                      </Link>
                    </Button>
                    <Button
                      className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                      asChild
                    >
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <UserPlus size={16} />
                        Đăng ký
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
