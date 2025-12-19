import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const headerClass =
    variant === 'transparent'
      ? 'absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50'
      : 'bg-white shadow-sm border-b border-gray-200';

  return (
    <header className={headerClass}>
      <div className="relative h-16">
        {/* Logo pinned to far left */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              GS
            </div>
            <span className="font-semibold">GiaSuOnline</span>
          </Link>
        </div>

        {/* Centered navigation (shadcn NavigationMenu) */}
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
          <div className="hidden md:flex w-full justify-center">
            <NavigationMenu>
              <NavigationMenuList className="space-x-10">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="text-xs font-normal uppercase tracking-wide hover:text-[hsl(var(--primary))]">
                      DỊCH VỤ GIA SƯ
                    </span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="text-xs font-normal uppercase tracking-wide hover:text-[hsl(var(--primary))]">
                      PHỤ HUYNH
                    </span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="text-xs font-normal uppercase tracking-wide hover:text-[hsl(var(--primary))]">
                      GIA SƯ
                    </span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="text-xs font-normal uppercase tracking-wide hover:text-[hsl(var(--primary))]">
                      DANH SÁCH GIA SƯ
                    </span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="text-xs font-normal uppercase tracking-wide hover:text-[hsl(var(--primary))]">
                      DANH SÁCH LỚP MỚI
                    </span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="text-xs font-normal uppercase tracking-wide hover:text-[hsl(var(--primary))]">
                      TIN TỨC
                    </span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Auth pinned to far right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/login">Đăng nhập</Link>
          </Button>
          <Link to="/register">
            <Button>Đăng ký</Button>
          </Link>
          <div className="md:hidden">
            <Button variant="ghost">☰</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
