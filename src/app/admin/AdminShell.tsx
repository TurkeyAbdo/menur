"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/Toast";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, key: "overview" },
  { href: "/admin/restaurants", icon: Store, key: "restaurants" },
  { href: "/admin/users", icon: Users, key: "users" },
  { href: "/admin/subscriptions", icon: CreditCard, key: "subscriptions" },
  { href: "/admin/analytics", icon: BarChart3, key: "analytics" },
  { href: "/admin/settings", icon: Settings, key: "settings" },
];

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.nav");
  const ta = useTranslations("admin");
  const tc = useTranslations("common");
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 start-0 z-50 flex h-full w-64 flex-col border-e border-gray-200 bg-white transition-transform lg:translate-x-0 lg:rtl:translate-x-0 ${
          open
            ? "translate-x-0 rtl:translate-x-0"
            : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xl font-bold text-indigo-600"
          >
            <ShieldCheck className="h-5 w-5" />
            {ta("adminPanel")}
          </Link>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
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

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (!session?.user || session.user.role !== "ADMIN") {
          router.replace("/dashboard");
        } else {
          setAuthorized(true);
        }
        setChecking(false);
      })
      .catch(() => {
        router.replace("/dashboard");
        setChecking(false);
      });
  }, [router]);

  if (checking || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:ps-64">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </header>

          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
