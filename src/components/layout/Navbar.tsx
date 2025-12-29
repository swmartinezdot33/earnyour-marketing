"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  { title: "Services", href: "/services" },
  { title: "Case Studies", href: "/case-studies" },
  { title: "Process", href: "/process" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "student" | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          setIsLoggedIn(true);
          setUserRole(data.session.role || "student");
        }
      })
      .catch(() => {
        // Not logged in
      });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-foreground/80"
                )}
              >
                {item.title}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link
                  href="/courses"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith("/courses") && !pathname.startsWith("/courses/") ? "text-primary" : "text-foreground/80"
                  )}
                >
                  Courses
                </Link>
                <Link
                  href={userRole === "admin" ? "/admin/courses" : "/dashboard"}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith("/admin") || pathname.startsWith("/dashboard") ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {userRole === "admin" ? "Admin" : "Dashboard"}
                </Link>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/free-audit">Get a Free Audit</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Nav */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-6">
                <Logo />
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === item.href ? "text-primary" : "text-foreground/80"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/courses"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-lg font-medium transition-colors hover:text-primary",
                          pathname.startsWith("/courses") && !pathname.startsWith("/courses/") ? "text-primary" : "text-foreground/80"
                        )}
                      >
                        Courses
                      </Link>
                      <Link
                        href={userRole === "admin" ? "/admin/courses" : "/dashboard"}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-lg font-medium transition-colors hover:text-primary",
                          pathname.startsWith("/admin") || pathname.startsWith("/dashboard") ? "text-primary" : "text-foreground/80"
                        )}
                      >
                        {userRole === "admin" ? "Admin" : "Dashboard"}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full mt-4">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button asChild className="w-full mt-2">
                        <Link href="/free-audit" onClick={() => setIsOpen(false)}>
                          Get a Free Audit
                        </Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
