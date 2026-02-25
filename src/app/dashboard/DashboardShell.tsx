"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Bell,
  Settings,
  MapPin,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ToastProvider } from "@/components/Toast";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, key: "overview" },
  { href: "/dashboard/menus", icon: UtensilsCrossed, key: "menus" },
  { href: "/dashboard/qr", icon: QrCode, key: "qrCodes" },
  { href: "/dashboard/analytics", icon: BarChart3, key: "analytics" },
  { href: "/dashboard/notifications", icon: Bell, key: "notifications" },
  { href: "/dashboard/locations", icon: MapPin, key: "locations" },
  { href: "/dashboard/billing", icon: CreditCard, key: "billing" },
  { href: "/dashboard/settings", icon: Settings, key: "settings" },
];

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 start-0 z-50 flex h-full w-64 flex-col border-e border-gray-200 bg-white transition-transform lg:translate-x-0 lg:rtl:translate-x-0 ${
          open ? "translate-x-0 rtl:translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
            {tc("appName")}
          </Link>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            {tc("logout")}
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="lg:ps-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
