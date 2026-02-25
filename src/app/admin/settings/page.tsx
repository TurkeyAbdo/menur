"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Loader2, Save, Globe } from "lucide-react";
import { useToast } from "@/components/Toast";

interface Settings {
  maxPhotoSizeMB: number;
  defaultCurrency: string;
  supportedCurrencies: string[];
  vatPercentage: number;
  maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPhotoSizeMB: settings.maxPhotoSizeMB,
          defaultCurrency: settings.defaultCurrency,
          vatPercentage: settings.vatPercentage,
          maintenanceMode: settings.maintenanceMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        toast("success", t("settings.settingsSaved"));
      } else {
        toast("error", t("settings.settingsFailed"));
      }
    } catch {
      toast("error", t("settings.settingsFailed"));
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const switchLocale = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    window.location.reload();
  };

  if (!settings) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("settings.title")}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {tc("save")}
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {/* Language */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Globe className="h-4 w-4 text-indigo-600" />
            {td("languageSettings")}
          </h2>
          <p className="mt-1 text-xs text-gray-500">{td("selectLanguage")}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => switchLocale("ar")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                locale === "ar"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tc("arabic")}
              {locale === "ar" && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
                  ✓
                </span>
              )}
            </button>
            <button
              onClick={() => switchLocale("en")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                locale === "en"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tc("english")}
              {locale === "en" && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Max Photo Size */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium text-gray-900">
            {t("settings.maxPhotoSize")}
          </label>
          <p className="mt-1 text-xs text-gray-500">
            {t("settings.maxPhotoSizeHint")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={50}
              value={settings.maxPhotoSizeMB}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxPhotoSizeMB: parseInt(e.target.value) || 1,
                })
              }
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">
              {t("settings.megabytes")}
            </span>
          </div>
        </div>

        {/* Default Currency */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium text-gray-900">
            {t("settings.defaultCurrency")}
          </label>
          <select
            value={settings.defaultCurrency}
            onChange={(e) =>
              setSettings({ ...settings, defaultCurrency: e.target.value })
            }
            className="mt-3 w-48 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {settings.supportedCurrencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* VAT Percentage */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium text-gray-900">
            {t("settings.vatPercentage")}
          </label>
          <p className="mt-1 text-xs text-gray-500">
            {t("settings.vatPercentageHint")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={settings.vatPercentage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  vatPercentage: parseFloat(e.target.value) || 0,
                })
              }
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                {t("settings.maintenanceMode")}
              </label>
              <p className="mt-1 text-xs text-gray-500">
                {t("settings.maintenanceModeHint")}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  maintenanceMode: !settings.maintenanceMode,
                })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                settings.maintenanceMode ? "bg-red-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  settings.maintenanceMode
                    ? "translate-x-5 rtl:-translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
