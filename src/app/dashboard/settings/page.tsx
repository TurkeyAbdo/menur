"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface RestaurantData {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  logo: string;
  description: string;
  descriptionAr: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  snapchat: string;
}

export default function SettingsPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/restaurant")
      .then((res) => res.json())
      .then((data) => {
        setRestaurant(data.restaurant || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurant),
      });

      if (res.ok) {
        setMessage(tc("success"));
      }
    } catch {
      setMessage(tc("error"));
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) => {
    setRestaurant((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) return <div className="text-center text-gray-500">...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>

      {message && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600">
          {message}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Restaurant Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">معلومات المطعم</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                اسم المطعم (عربي)
              </label>
              <input
                type="text"
                value={restaurant?.nameAr || ""}
                onChange={(e) => update("nameAr", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Name (English)
              </label>
              <input
                type="text"
                value={restaurant?.name || ""}
                onChange={(e) => update("name", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                الوصف (عربي)
              </label>
              <textarea
                value={restaurant?.descriptionAr || ""}
                onChange={(e) => update("descriptionAr", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (English)
              </label>
              <textarea
                value={restaurant?.description || ""}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={restaurant?.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={restaurant?.email || ""}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">روابط التواصل</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram</label>
              <input
                type="text"
                value={restaurant?.instagram || ""}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Twitter/X</label>
              <input
                type="text"
                value={restaurant?.twitter || ""}
                onChange={(e) => update("twitter", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">TikTok</label>
              <input
                type="text"
                value={restaurant?.tiktok || ""}
                onChange={(e) => update("tiktok", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Snapchat</label>
              <input
                type="text"
                value={restaurant?.snapchat || ""}
                onChange={(e) => update("snapchat", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "..." : tc("save")}
        </button>
      </div>
    </div>
  );
}
