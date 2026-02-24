"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Plus,
} from "lucide-react";

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

export default function DashboardPage() {
  const t = useTranslations("dashboard");

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
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t("activeMenus")}
          value={0}
          icon={UtensilsCrossed}
          color="bg-indigo-500"
        />
        <StatCard
          title={t("totalScans")}
          value={0}
          icon={BarChart3}
          color="bg-emerald-500"
        />
        <StatCard
          title={t("totalItems")}
          value={0}
          icon={QrCode}
          color="bg-amber-500"
        />
      </div>

      {/* Empty state */}
      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
        <UtensilsCrossed className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {t("noMenus")}
        </h3>
        <Link
          href="/dashboard/menus/new"
          className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          {t("createMenu")}
        </Link>
      </div>
    </div>
  );
}
