import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  XCircle,
  Trash2,
  Settings,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Quản lý Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Bài viết",
    icon: FileText,
    href: "/posts",
    children: [
      { title: "Chờ duyệt", href: "/posts/pending", icon: Clock },
      { title: "Đã từ chối", href: "/posts/rejected", icon: XCircle },
      { title: "Đã xóa", href: "/posts/deleted", icon: Trash2 },
    ],
  },
  {
    title: "Cài đặt",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            {!isCollapsed && (
              <span className="font-bold text-lg">Admin Panel</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(isCollapsed && "hidden")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link to={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="icon"
                        className="w-full"
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={item.href}>
                <Link to={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "bg-secondary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Button>
                </Link>

                {/* Sub items */}
                {item.children && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.href;
                      const ChildIcon = child.icon;
                      return (
                        <Link key={child.href} to={child.href}>
                          <Button
                            variant={isChildActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-2",
                              isChildActive && "bg-secondary"
                            )}
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.title}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <Separator className="my-2" />

        {/* Collapse button for collapsed state */}
        {isCollapsed && (
          <div className="p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-full"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
