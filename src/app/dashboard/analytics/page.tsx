"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BarChart3, Smartphone, Monitor, Tablet } from "lucide-react";

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

  if (loading) return <div className="text-center text-gray-500">...</div>;
  if (!data) return <div className="text-center text-gray-500">لا توجد بيانات</div>;

  const maxDaily = Math.max(...data.dailyScans.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("analytics")}</h1>

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">إجمالي المسح</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data.totalScans}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">اليوم</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{data.todayScans}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">هذا الأسبوع</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{data.weekScans}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">هذا الشهر</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{data.monthScans}</p>
        </div>
      </div>

      {/* Device breakdown */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">الأجهزة</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{data.deviceBreakdown.mobile}</p>
              <p className="text-xs text-blue-500">موبايل</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-4">
            <Monitor className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{data.deviceBreakdown.desktop}</p>
              <p className="text-xs text-purple-500">كمبيوتر</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-teal-50 p-4">
            <Tablet className="h-8 w-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-teal-600">{data.deviceBreakdown.tablet}</p>
              <p className="text-xs text-teal-500">تابلت</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily chart (simple bar chart) */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">آخر 14 يوم</h2>
        <div className="mt-4 flex items-end gap-1" style={{ height: 200 }}>
          {data.dailyScans.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{day.count}</span>
              <div
                className="w-full rounded-t bg-indigo-500 transition-all"
                style={{
                  height: `${(day.count / maxDaily) * 160}px`,
                  minHeight: day.count > 0 ? 4 : 0,
                }}
              />
              <span className="text-xs text-gray-400" dir="ltr">
                {new Date(day.date).getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
