"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Eye,
  Calendar,
  Activity,
  Loader2,
} from "lucide-react";

interface AnalyticsData {
  totalScans: number;
  todayScans: number;
  weekScans: number;
  monthScans: number;
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  dailyScans: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const t = useTranslations("dashboard");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
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

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("analytics")}</h1>
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {t("noAnalytics")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("analyticsHint")}
          </p>
        </div>
      </div>
    );
  }

  const maxDaily = Math.max(...data.dailyScans.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("analytics")}</h1>

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("totalScans")}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.totalScans}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("today")}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.todayScans}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <Eye className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("thisWeek")}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.weekScans}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t("thisMonth")}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.monthScans}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Device breakdown */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Activity className="h-5 w-5 text-indigo-600" />
          {t("deviceBreakdown")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.deviceBreakdown.mobile}
              </p>
              <p className="text-xs text-gray-500">{t("mobile")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50">
              <Monitor className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.deviceBreakdown.desktop}
              </p>
              <p className="text-xs text-gray-500">{t("desktop")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50">
              <Tablet className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.deviceBreakdown.tablet}
              </p>
              <p className="text-xs text-gray-500">{t("tablet")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily chart */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          {t("last14Days")}
        </h2>
        <div className="mt-4 flex items-end gap-1.5" style={{ height: 200 }}>
          {data.dailyScans.map((day) => (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-[10px] font-medium text-gray-500">
                {day.count > 0 ? day.count : ""}
              </span>
              <div
                className="w-full rounded-t bg-indigo-500 transition-all hover:bg-indigo-600"
                style={{
                  height: `${Math.max((day.count / maxDaily) * 150, 4)}px`,
                }}
                title={`${day.date}: ${day.count}`}
              />
              <span className="text-[10px] text-gray-400" dir="ltr">
                {new Date(day.date).getDate()}
              </span>
            </div>
          ))}
          {data.dailyScans.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              {t("noScanData")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
