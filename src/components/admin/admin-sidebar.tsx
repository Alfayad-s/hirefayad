"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ReactNode };

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const base = `/${locale}/admin`;
  const nav: NavItem[] = [
    { href: base, label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
    { href: `${base}/services`, label: "Services", icon: <Package className="size-4" /> },
    { href: `${base}/coupons`, label: "Coupons", icon: <Ticket className="size-4" /> },
    { href: `${base}/users`, label: "Users", icon: <Users className="size-4" /> },
  ];

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      <div className="p-4">
        <Link href={base} className="text-lg font-semibold text-foreground">
          Admin
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== base && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
