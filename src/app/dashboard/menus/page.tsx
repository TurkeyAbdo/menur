"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Plus, Eye, Edit2, Trash2, UtensilsCrossed, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

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
  const tc = useTranslations("common");
  const tm = useTranslations("menu.builder");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/menus")
      .then((res) => res.json())
      .then((data) => {
        setMenus(data.menus || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDuplicate = async (menuId: string) => {
    setDuplicating(menuId);
    try {
      const res = await fetch(`/api/menus/${menuId}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMenus((prev) => [data.menu, ...prev]);
        toast("success", t("menuDuplicated"));
      } else {
        toast("error", data.error || t("menuDuplicateFailed"));
      }
    } catch {
      toast("error", t("menuDuplicateFailed"));
    }
    setDuplicating(null);
  };

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
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                    <UtensilsCrossed className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isAr ? (menu.nameAr || menu.name) : menu.name}
                    </h3>
                    {menu.nameAr && menu.name && (
                      <p className="text-xs text-gray-400">
                        {isAr ? menu.name : menu.nameAr}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    menu.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {menu.status === "PUBLISHED" ? tm("published") : tm("draft")}
                </span>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                {menu._count.categories} {t("categories")} &middot; {menu.layout === "TABBED" ? tm("tabbed") : tm("scrollable")}
              </div>

              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <Link
                  href={`/dashboard/menus/${menu.id}/preview`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {tc("preview")}
                </Link>
                <Link
                  href={`/dashboard/menus/${menu.id}/edit`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  {tc("edit")}
                </Link>
                <button
                  onClick={() => handleDuplicate(menu.id)}
                  disabled={duplicating === menu.id}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                >
                  {duplicating === menu.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {t("duplicateMenu")}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(t("deleteMenuConfirm"))) return;
                    await fetch(`/api/menus/${menu.id}`, { method: "DELETE" });
                    setMenus((prev) => prev.filter((m) => m.id !== menu.id));
                    toast("success", t("menuDeleted"));
                  }}
                  className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}