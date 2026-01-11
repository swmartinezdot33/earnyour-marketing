"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Receipt,
  FileText,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: Receipt,
  },
  {
    title: "Reports",
    href: "/admin/reports/products",
    icon: FileText,
    children: [
      {
        title: "Product Reports",
        href: "/admin/reports/products",
      },
    ],
  },
  {
    title: "Settings",
    href: "/admin/settings/stripe",
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {/* Logo at top of sidebar */}
      <div className="pb-4 border-b">
        <Link href="/admin/dashboard">
          <Logo className="justify-start" />
        </Link>
      </div>
      
      <div className="space-y-1">
        {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
            {hasChildren && isActive && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children?.map((child) => {
                  const isChildActive = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors",
                        isChildActive
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <span>{child.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </nav>
  );
}

