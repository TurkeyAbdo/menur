"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Analytics {
  totalScans: number;
  todayScans: number;
  weekScans: number;
  monthScans: number;
  deviceBreakdown: { deviceType: string; count: number }[];
  dailyScans: { date: string; count: number }[];
  topRestaurants: { name: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin");
  const td = useTranslations("dashboard");
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
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

  if (!data) return null;

  const maxChart = Math.max(...data.dailyScans.map((d) => d.count), 1);
  const maxRestaurant = Math.max(
    ...(data.topRestaurants.map((r) => r.count) || [1]),
    1
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t("analytics.title")}
      </h1>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("stats.totalScans"), value: data.totalScans },
          { label: td("today"), value: data.todayScans },
          { label: td("thisWeek"), value: data.weekScans },
          { label: td("thisMonth"), value: data.monthScans },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">
          {t("analytics.last30Days")}
        </h2>
        <div className="mt-6 flex items-end gap-1" style={{ height: 180 }}>
          {data.dailyScans.map((day, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-indigo-500 transition-all hover:bg-indigo-600"
                style={{
                  height: `${Math.max((day.count / maxChart) * 160, 2)}px`,
                }}
                title={`${day.date}: ${day.count}`}
              />
              {i % 5 === 0 && (
                <span className="text-[9px] text-gray-400" dir="ltr">
                  {new Date(day.date).getDate()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Device breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">
            {t("analytics.deviceBreakdown")}
          </h2>
          {data.deviceBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">
              {t("analytics.noAnalyticsData")}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.deviceBreakdown.map((d) => {
                const total = data.deviceBreakdown.reduce(
                  (s, x) => s + x.count,
                  0
                );
                const pct = total > 0 ? (d.count / total) * 100 : 0;
                return (
                  <div key={d.deviceType} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600">
                      {d.deviceType}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-end text-sm text-gray-700">
                      {d.count} ({Math.round(pct)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top restaurants */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">
            {t("analytics.topRestaurants")}
          </h2>
          {data.topRestaurants.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">
              {t("analytics.noAnalyticsData")}
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {data.topRestaurants.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                    {r.name}
                  </span>
                  <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${(r.count / maxRestaurant) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-end text-sm font-medium text-gray-600">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
