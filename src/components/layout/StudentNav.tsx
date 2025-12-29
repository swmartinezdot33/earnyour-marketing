"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Settings, CreditCard, Home } from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { title: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

