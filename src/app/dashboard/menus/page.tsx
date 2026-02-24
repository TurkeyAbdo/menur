"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Plus, MoreVertical, Eye, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MenuData {
  id: string;
  name: string;
  nameAr: string | null;
  status: "DRAFT" | "PUBLISHED";
  layout: string;
  _count: { categories: number };
  createdAt: string;
}

export default function MenusPage() {
  const t = useTranslations("dashboard");
  const tm = useTranslations("menu.builder");
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menus")
      .then((res) => res.json())
      .then((data) => {
        setMenus(data.menus || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("menus")}</h1>
        <Link
          href="/dashboard/menus/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          {t("createMenu")}
        </Link>
      </div>

      {loading ? (
        <div className="mt-12 text-center text-gray-500">...</div>
      ) : menus.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
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
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {menu.nameAr || menu.name}
                  </h3>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      menu.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {menu.status === "PUBLISHED" ? tm("publish") : tm("saveDraft")}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/dashboard/menus/${menu.id}/preview`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/menus/${menu.id}/edit`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {menu._count.categories} {tm("addCategory").split(" ").pop()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
