"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Store,
  Users,
  CreditCard,
  BarChart3,
  DollarSign,
  UserPlus,
  Loader2,
} from "lucide-react";

interface Stats {
  totalRestaurants: number;
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalScans: number;
  recentSignups: number;
  tierBreakdown: { FREE: number; BASIC: number; PRO: number; ENTERPRISE: number };
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    provider: string;
    createdAt: string;
  }[];
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
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

  if (!stats) return null;

  const tierTotal =
    stats.tierBreakdown.FREE +
    stats.tierBreakdown.BASIC +
    stats.tierBreakdown.PRO +
    stats.tierBreakdown.ENTERPRISE;

  const tierColors = {
    FREE: "bg-gray-400",
    BASIC: "bg-blue-500",
    PRO: "bg-indigo-500",
    ENTERPRISE: "bg-purple-500",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t("nav.overview")}</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t("stats.totalRestaurants")}
          value={stats.totalRestaurants}
          icon={Store}
          color="bg-indigo-500"
        />
        <StatCard
          title={t("stats.totalUsers")}
          value={stats.totalUsers}
          icon={Users}
          color="bg-emerald-500"
        />
        <StatCard
          title={t("stats.activeSubscriptions")}
          value={stats.activeSubscriptions}
          icon={CreditCard}
          color="bg-amber-500"
        />
        <StatCard
          title={t("stats.totalRevenue")}
          value={`${stats.totalRevenue.toLocaleString()} SAR`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title={t("stats.totalScans")}
          value={stats.totalScans}
          icon={BarChart3}
          color="bg-blue-500"
        />
        <StatCard
          title={t("stats.recentSignups")}
          value={stats.recentSignups}
          icon={UserPlus}
          color="bg-purple-500"
        />
      </div>

      {/* Tier Breakdown */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">{t("stats.tierBreakdown")}</h2>
        <div className="mt-4 space-y-3">
          {(["FREE", "BASIC", "PRO", "ENTERPRISE"] as const).map((tier) => {
            const count = stats.tierBreakdown[tier];
            const pct = tierTotal > 0 ? (count / tierTotal) * 100 : 0;
            return (
              <div key={tier} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-600">
                  {t(`tiers.${tier}`)}
                </span>
                <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tierColors[tier]} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-end text-sm font-medium text-gray-700">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Signups */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">
          {t("stats.recentSignups")} ({t("stats.last7Days")})
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-start">
                <th className="pb-3 pe-4 font-medium text-gray-500 text-start">
                  {t("table.name")}
                </th>
                <th className="pb-3 pe-4 font-medium text-gray-500 text-start">
                  {t("table.email")}
                </th>
                <th className="pb-3 pe-4 font-medium text-gray-500 text-start">
                  {t("table.role")}
                </th>
                <th className="pb-3 pe-4 font-medium text-gray-500 text-start">
                  {t("table.provider")}
                </th>
                <th className="pb-3 font-medium text-gray-500 text-start">
                  {t("table.created")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pe-4 text-gray-900">
                    {user.name || "—"}
                  </td>
                  <td className="py-3 pe-4 text-gray-600">{user.email}</td>
                  <td className="py-3 pe-4">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {t(`roles.${user.role}`)}
                    </span>
                  </td>
                  <td className="py-3 pe-4">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {user.provider}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
