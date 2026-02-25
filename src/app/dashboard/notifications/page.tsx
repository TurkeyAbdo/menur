"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Gift,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Settings,
  Loader2,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  titleAr: string | null;
  message: string;
  messageAr: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  WELCOME: Gift,
  SUBSCRIPTION_EXPIRING: AlertTriangle,
  SUBSCRIPTION_EXPIRED: AlertTriangle,
  WEEKLY_REPORT: BarChart3,
  MENU_TIP: Lightbulb,
  SYSTEM: Settings,
};

const typeColors: Record<string, string> = {
  WELCOME: "text-emerald-500 bg-emerald-50",
  SUBSCRIPTION_EXPIRING: "text-amber-500 bg-amber-50",
  SUBSCRIPTION_EXPIRED: "text-red-500 bg-red-50",
  WEEKLY_REPORT: "text-blue-500 bg-blue-50",
  MENU_TIP: "text-purple-500 bg-purple-50",
  SYSTEM: "text-gray-500 bg-gray-50",
};

export default function NotificationsPage() {
  const t = useTranslations("dashboard");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = (p: number) => {
    fetch(`/api/notifications?page=${p}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const markAsRead = async (ids: string[]) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - ids.length));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("notifications")}
          </h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Bell className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No notifications yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;ll see updates about your account and menus here
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colors = typeColors[notif.type] || "text-gray-500 bg-gray-50";

            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markAsRead([notif.id])}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition hover:shadow-md ${
                  notif.isRead
                    ? "border-gray-200 bg-white"
                    : "border-indigo-200 bg-indigo-50/30"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-semibold ${
                        notif.isRead ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {notif.titleAr || notif.title}
                    </h3>
                    <span className="shrink-0 text-xs text-gray-400">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      notif.isRead ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {notif.messageAr || notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
