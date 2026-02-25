"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Subscription {
  id: string;
  tier: string;
  status: string;
  priceAmount: string;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    restaurant: { name: string } | null;
  };
}

const tierBadgeColors: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-700",
  BASIC: "bg-blue-50 text-blue-700",
  PRO: "bg-indigo-50 text-indigo-700",
  ENTERPRISE: "bg-purple-50 text-purple-700",
};

const statusBadgeColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  EXPIRED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-50 text-red-700",
  PAST_DUE: "bg-amber-50 text-amber-700",
};

export default function AdminSubscriptionsPage() {
  const t = useTranslations("admin");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tierCounts, setTierCounts] = useState({
    FREE: 0,
    BASIC: 0,
    PRO: 0,
    ENTERPRISE: 0,
  });

  const fetchData = useCallback((tf: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (tf) params.set("tier", tf);

    fetch(`/api/admin/subscriptions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSubscriptions(data.subscriptions || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setTierCounts(
          data.tierCounts || { FREE: 0, BASIC: 0, PRO: 0, ENTERPRISE: 0 }
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(tierFilter, page);
  }, [tierFilter, page, fetchData]);

  const tierCardColors = {
    FREE: "border-gray-200",
    BASIC: "border-blue-200",
    PRO: "border-indigo-200",
    ENTERPRISE: "border-purple-200",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t("subscriptions.title")}
      </h1>

      {/* Tier count cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["FREE", "BASIC", "PRO", "ENTERPRISE"] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => {
              setTierFilter(tierFilter === tier ? "" : tier);
              setPage(1);
            }}
            className={`rounded-xl border-2 bg-white p-4 text-start transition hover:shadow-md ${
              tierFilter === tier
                ? "border-indigo-500 ring-1 ring-indigo-500"
                : tierCardColors[tier]
            }`}
          >
            <p className="text-sm text-gray-500">{t(`tiers.${tier}`)}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {tierCounts[tier]}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {t("subscriptions.noSubscriptions")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.email")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.restaurant")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.tier")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.status")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.price")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.period")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {sub.user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {sub.user.restaurant?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierBadgeColors[sub.tier]}`}
                      >
                        {t(`tiers.${sub.tier}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeColors[sub.status]}`}
                      >
                        {t(`statuses.${sub.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">
                      {Number(sub.priceAmount).toLocaleString()} SAR
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(sub.currentPeriodStart).toLocaleDateString()}
                      {sub.currentPeriodEnd &&
                        ` → ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-500">
              {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
