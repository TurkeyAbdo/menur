"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Plus,
  Loader2,
  MapPin,
  Eye,
  Edit2,
  Settings,
  Bell,
  ArrowRight,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Link>
  );
}

interface MenuData {
  id: string;
  name: string;
  nameAr: string | null;
  status: "DRAFT" | "PUBLISHED";
  layout: string;
  _count: { categories: number };
  createdAt: string;
}

interface ChartDay {
  date: string;
  count: number;
}

interface Analytics {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  chartData: ChartDay[];
  deviceBreakdown: { deviceType: string; count: number }[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tm = useTranslations("menu.builder");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [locationCount, setLocationCount] = useState(0);
  const [qrCount, setQrCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/menus").then((r) => r.json()),
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/qr").then((r) => r.json()),
      fetch("/api/notifications?limit=1").then((r) => r.json()),
    ])
      .then(([menusData, analyticsData, locationsData, qrData, notifData]) => {
        setMenus(menusData.menus || []);
        setAnalytics(analyticsData);
        setLocationCount((locationsData.locations || []).length);
        setQrCount((qrData.qrCodes || []).length);
        setNotifCount(notifData.unreadCount || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const maxChart = Math.max(...(analytics?.chartData?.map((d) => d.count) || [1]), 1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("welcome")} 👋
        </h1>
        <Link
          href="/dashboard/menus/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          {t("createMenu")}
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("activeMenus")}
          value={menus.length}
          icon={UtensilsCrossed}
          color="bg-indigo-500"
          href="/dashboard/menus"
        />
        <StatCard
          title={t("totalScans")}
          value={analytics?.total || 0}
          icon={BarChart3}
          color="bg-emerald-500"
          href="/dashboard/analytics"
        />
        <StatCard
          title={t("qrCodes")}
          value={qrCount}
          icon={QrCode}
          color="bg-amber-500"
          href="/dashboard/qr"
        />
        <StatCard
          title={t("locations")}
          value={locationCount}
          icon={MapPin}
          color="bg-purple-500"
          href="/dashboard/locations"
        />
      </div>

      {/* Main content grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Scan chart — takes 2 columns */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{t("scanActivity")}</h2>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-400">{t("today")}</span>{" "}
                <span className="font-bold text-gray-900">{analytics?.today || 0}</span>
              </div>
              <div>
                <span className="text-gray-400">{t("thisWeek")}</span>{" "}
                <span className="font-bold text-gray-900">{analytics?.thisWeek || 0}</span>
              </div>
              <div>
                <span className="text-gray-400">{t("thisMonth")}</span>{" "}
                <span className="font-bold text-gray-900">{analytics?.thisMonth || 0}</span>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-6 flex items-end gap-1.5" style={{ height: 160 }}>
            {(analytics?.chartData || []).map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-indigo-500 transition-all hover:bg-indigo-600"
                  style={{
                    height: `${Math.max((day.count / maxChart) * 140, 4)}px`,
                  }}
                  title={`${day.date}: ${day.count}`}
                />
                <span className="text-[10px] text-gray-400" dir="ltr">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
            {(!analytics?.chartData || analytics.chartData.length === 0) && (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                {t("noScanData")}
              </div>
            )}
          </div>

          {/* Device breakdown */}
          {analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 && (
            <div className="mt-4 flex gap-4 border-t border-gray-100 pt-4">
              {analytics.deviceBreakdown.map((d) => (
                <div key={d.deviceType} className="text-sm">
                  <span className="text-gray-400">{d.deviceType || "Unknown"}</span>{" "}
                  <span className="font-medium text-gray-700">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">{t("quickActions")}</h2>
          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard/menus/new"
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-indigo-50 hover:border-indigo-200"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <Plus className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t("createMenu")}</span>
            </Link>
            <Link
              href="/dashboard/qr"
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-emerald-50 hover:border-emerald-200"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <QrCode className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t("generateQR")}</span>
            </Link>
            <Link
              href="/dashboard/locations"
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-purple-50 hover:border-purple-200"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t("addLocation")}</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-amber-50 hover:border-amber-200"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <BarChart3 className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t("viewAnalytics")}</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-100 hover:border-gray-300"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Settings className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t("restaurantSettings")}</span>
            </Link>
          </div>

          {/* Unread notifications */}
          {notifCount > 0 && (
            <Link
              href="/dashboard/notifications"
              className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 p-3"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  {t("unreadNotifications", { count: notifCount })}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-400" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent Menus */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t("recentMenus")}</h2>
          <Link
            href="/dashboard/menus"
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {tc("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {menus.length === 0 ? (
          <div className="mt-6 flex flex-col items-center py-8 text-center">
            <UtensilsCrossed className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">{t("noMenus")}</p>
            <Link
              href="/dashboard/menus/new"
              className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              {t("createMenu")}
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {menus.slice(0, 5).map((menu) => (
              <div
                key={menu.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                    <UtensilsCrossed className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isAr ? (menu.nameAr || menu.name) : menu.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {menu._count.categories} {t("categories")} &middot;{" "}
                      {menu.layout === "TABBED" ? tm("tabbed") : tm("scrollable")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      menu.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {menu.status === "PUBLISHED" ? tm("published") : tm("draft")}
                  </span>
                  <Link
                    href={`/dashboard/menus/${menu.id}/preview`}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/menus/${menu.id}/edit`}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
