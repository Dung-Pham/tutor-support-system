import { useState } from "react";
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
  ChevronRight,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
      { title: "Đã duyệt", href: "/posts", icon: CheckCircle },
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
  const [openMenus, setOpenMenus] = useState<string[]>(["/posts"]);

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

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
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.href);
            const isActive = hasChildren
              ? item.children.some((child) => location.pathname === child.href)
              : location.pathname === item.href;

            // Collapsed state
            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link to={hasChildren ? item.children[0].href : item.href}>
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

            // Expanded state - no children
            if (!hasChildren) {
              return (
                <Link key={item.href} to={item.href}>
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
              );
            }

            // Expanded state - with children (Collapsible)
            return (
              <Collapsible
                key={item.href}
                open={isOpen}
                onOpenChange={() => toggleMenu(item.href)}
                className="group/collapsible"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "bg-secondary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                    <ChevronRight
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l pl-2">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location.pathname === child.href;

                      return (
                        <Link key={child.href} to={child.href}>
                          <Button
                            variant={isChildActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-2",
                              isChildActive && "bg-secondary font-medium"
                            )}
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.title}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
