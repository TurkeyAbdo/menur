"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Plus, Edit2, Trash2, Palette, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface ThemeData {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  config: {
    colors: Record<string, string>;
    layout?: { itemStyle?: string; categoryStyle?: string };
    features?: { showPhotos?: boolean; showDecorations?: boolean; customFont?: boolean };
  };
  _count?: { menus: number };
}

export default function ThemesPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();

  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/themes/custom").then((r) => r.json()),
      fetch("/api/subscriptions").then((r) => r.json()),
    ])
      .then(([themesData, subData]) => {
        setThemes(themesData.themes || []);
        setTier(subData.subscription?.tier || "FREE");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isEnterprise = tier === "ENTERPRISE";

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteThemeConfirm"))) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/themes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setThemes((prev) => prev.filter((th) => th.id !== id));
        toast("success", t("themeDeleted"));
      } else {
        toast("error", data.error || tc("somethingWrong"));
      }
    } catch {
      toast("error", tc("somethingWrong"));
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Enterprise gate
  if (!isEnterprise) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-amber-50 p-4">
          <Lock className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">{t("themeBuilder")}</h2>
        <p className="mt-2 max-w-sm text-gray-500">{t("enterpriseOnly")}</p>
        <Link
          href="/dashboard/billing"
          className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          {t("upgradeBtn")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("themes")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("themeBuilderDesc")}</p>
        </div>
        <Link
          href="/dashboard/themes/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          {t("createTheme")}
        </Link>
      </div>

      {themes.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-indigo-50 p-4">
            <Palette className="h-10 w-10 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{t("noThemes")}</h3>
          <p className="mt-1 text-sm text-gray-500">{t("noThemesHint")}</p>
          <Link
            href="/dashboard/themes/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            {t("createTheme")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => {
            const c = theme.config.colors;
            return (
              <div
                key={theme.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                {/* Color preview */}
                <div className="p-4" style={{ backgroundColor: c.background }}>
                  <div className="flex gap-1.5">
                    {[c.primary, c.accent, c.text, c.price, c.special].map((color, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full border border-white/30"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between rounded-md p-2" style={{ backgroundColor: c.surface }}>
                      <div className="h-2 w-16 rounded" style={{ backgroundColor: c.text, opacity: 0.7 }} />
                      <div className="h-2 w-8 rounded" style={{ backgroundColor: c.price }} />
                    </div>
                    <div className="flex items-center justify-between rounded-md p-2" style={{ backgroundColor: c.surface }}>
                      <div className="h-2 w-12 rounded" style={{ backgroundColor: c.text, opacity: 0.7 }} />
                      <div className="h-2 w-6 rounded" style={{ backgroundColor: c.price }} />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {isAr ? theme.nameAr || theme.name : theme.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {theme.config.layout?.itemStyle || "list"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/themes/${theme.id}/edit`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(theme.id)}
                      disabled={deleting === theme.id}
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                    >
                      {deleting === theme.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
