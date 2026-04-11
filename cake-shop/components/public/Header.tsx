"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import type { IHeader } from "@/lib/models/Header";

interface HeaderProps {
  data: IHeader | null;
}

export function Header({ data }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "superadmin";
  const { itemCount } = useCart();

  const navigation = data?.navigation
    ?.filter((n) => n.isVisible)
    ?.sort((a, b) => a.order - b.order) || [
    { label: "Home", href: "/", order: 0, isVisible: true },
    { label: "About", href: "/about", order: 1, isVisible: true },
    { label: "Menu", href: "/menu", order: 2, isVisible: true },
    { label: "Gallery", href: "/gallery", order: 3, isVisible: true },
    { label: "Contact", href: "/contact", order: 4, isVisible: true },
  ];

  const ctaButton = data?.ctaButton || {
    text: "Order Now",
    href: "/menu",
    isVisible: true,
  };

  return (
    <header
      className={cn(
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50",
        data?.isSticky !== false && "sticky top-0"
      )}
    >
      <div className="container-custom flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link href={data?.logo?.linkTo || "/"} className="flex items-center gap-2">
          {data?.logo?.imageUrl ? (
            <Image
              src={data.logo.imageUrl}
              alt={data.logo.altText || "Sweet Delights"}
              width={data.logo.width || 60}
              height={data.logo.height || 60}
              style={{ width: data.logo.width || 60, height: data.logo.height || 60 }}
            />
          ) : (
            <span className="font-heading text-xl font-bold text-cake-brown md:text-2xl">
              Sweet Delights
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-cake-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 transition-colors hover:bg-accent"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          {session ? (
            <Link href="/cart" className="relative rounded-full p-2 hover:bg-accent">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cake-gold px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          ) : null}

          <Link href={session ? "/profile" : "/login"} className="rounded-full p-2 hover:bg-accent">
            <User className="h-5 w-5" />
          </Link>

          {isAdmin && (
            <Link href="/admin" className="rounded-full p-2 hover:bg-accent" title="Admin Dashboard">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}

          {ctaButton.isVisible && (
            <Link href={ctaButton.href} className="hidden md:inline-flex">
              <Button className="bg-cake-gold text-white hover:bg-cake-brown">{ctaButton.text}</Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="md:hidden rounded-full p-2 hover:bg-accent">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-cake-gold"
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-cake-gold"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                )}
                {ctaButton.isVisible && (
                  <Link href={ctaButton.href} onClick={() => setIsOpen(false)}>
                    <Button className="mt-4 w-full bg-cake-gold text-white hover:bg-cake-brown">
                      {ctaButton.text}
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
