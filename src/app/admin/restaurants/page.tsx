"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  createdAt: string;
  owner: {
    email: string;
    name: string | null;
    subscription: { tier: string } | null;
  };
  _count: { menus: number; locations: number };
}

const tierBadgeColors: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-700",
  BASIC: "bg-blue-50 text-blue-700",
  PRO: "bg-indigo-50 text-indigo-700",
  ENTERPRISE: "bg-purple-50 text-purple-700",
};

export default function AdminRestaurantsPage() {
  const t = useTranslations("admin");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(
    (s: string, p: number) => {
      setLoading(true);
      fetch(`/api/admin/restaurants?search=${encodeURIComponent(s)}&page=${p}&limit=20`)
        .then((r) => r.json())
        .then((data) => {
          setRestaurants(data.restaurants || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    fetchData(search, page);
  }, [page, fetchData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchData(search, 1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, fetchData]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {t("restaurants.title")}
      </h1>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("restaurants.searchRestaurants")}
            className="w-full rounded-lg border border-gray-200 py-2 ps-10 pe-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-sm text-gray-500">
          {t("pagination.showing")} {total} {t("pagination.entries")}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {t("restaurants.noRestaurants")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.name")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.owner")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.tier")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.menus")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.locations")}
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-start">
                    {t("table.created")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {restaurants.map((r) => {
                  const tier = r.owner.subscription?.tier || "FREE";
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.owner.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierBadgeColors[tier] || tierBadgeColors.FREE}`}
                        >
                          {t(`tiers.${tier}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r._count.menus}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r._count.locations}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
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
