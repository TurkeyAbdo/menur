"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import {
  ImagePlus,
  X,
  Loader2,
  Building2,
  Share2,
  Save,
  CheckCircle2,
} from "lucide-react";

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
        setTimeout(() => setMessage(""), 3000);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        update("logo", data.url);
      }
    } catch {
      // ignore
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
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
          {saving ? "Saving..." : tc("save")}
        </button>
      </div>

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Restaurant Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Restaurant Info
          </h2>

          {/* Logo Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Restaurant Logo
            </label>
            <div className="mt-2 flex items-center gap-4">
              {restaurant?.logo ? (
                <div className="relative">
                  <img
                    src={restaurant.logo}
                    alt="Logo"
                    className="h-20 w-20 rounded-xl border border-gray-200 bg-white object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => update("logo", "")}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition hover:border-indigo-400">
                  {uploadingLogo ? (
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-gray-400" />
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </label>
              )}
              {restaurant?.logo && (
                <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                  Change
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Name (Arabic)
              </label>
              <input
                type="text"
                value={restaurant?.nameAr || ""}
                onChange={(e) => update("nameAr", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (Arabic)
              </label>
              <textarea
                value={restaurant?.descriptionAr || ""}
                onChange={(e) => update("descriptionAr", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={restaurant?.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={restaurant?.email || ""}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Share2 className="h-5 w-5 text-indigo-600" />
            Social Links
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <input
                type="text"
                value={restaurant?.instagram || ""}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter/X
              </label>
              <input
                type="text"
                value={restaurant?.twitter || ""}
                onChange={(e) => update("twitter", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                TikTok
              </label>
              <input
                type="text"
                value={restaurant?.tiktok || ""}
                onChange={(e) => update("tiktok", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Snapchat
              </label>
              <input
                type="text"
                value={restaurant?.snapchat || ""}
                onChange={(e) => update("snapchat", e.target.value)}
                placeholder="@username"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
