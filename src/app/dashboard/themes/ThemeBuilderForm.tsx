"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/Toast";

interface ThemeConfig {
  colors: Record<string, string>;
  fonts: { heading: string; body: string };
  layout: { itemStyle: string; categoryStyle: string };
  decoration: { type: string; color: string };
  features: { showPhotos: boolean; showDecorations: boolean; customFont: boolean };
}

interface ThemeBuilderFormProps {
  initialData?: {
    id: string;
    name: string;
    nameAr: string | null;
    config: ThemeConfig;
  };
}

const DEFAULT_CONFIG: ThemeConfig = {
  colors: {
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#111827",
    textSecondary: "#6b7280",
    primary: "#4f46e5",
    accent: "#8b5cf6",
    border: "#e5e7eb",
    price: "#059669",
    unavailable: "#ef4444",
    special: "#f59e0b",
  },
  fonts: { heading: "IBM Plex Sans Arabic", body: "IBM Plex Sans Arabic" },
  layout: { itemStyle: "list", categoryStyle: "simple" },
  decoration: { type: "none", color: "#4f46e5" },
  features: { showPhotos: false, showDecorations: false, customFont: false },
};

const COLOR_FIELDS = [
  { key: "background", labelAr: "الخلفية", labelEn: "Background" },
  { key: "surface", labelAr: "السطح", labelEn: "Surface" },
  { key: "text", labelAr: "النص", labelEn: "Text" },
  { key: "textSecondary", labelAr: "النص الثانوي", labelEn: "Secondary Text" },
  { key: "primary", labelAr: "اللون الأساسي", labelEn: "Primary" },
  { key: "accent", labelAr: "اللون المميز", labelEn: "Accent" },
  { key: "border", labelAr: "الحدود", labelEn: "Border" },
  { key: "price", labelAr: "السعر", labelEn: "Price" },
  { key: "unavailable", labelAr: "غير متوفر", labelEn: "Unavailable" },
  { key: "special", labelAr: "مميز", labelEn: "Special" },
];

const FONTS = [
  "IBM Plex Sans Arabic",
  "Amiri",
  "Cairo",
  "Tajawal",
  "Noto Kufi Arabic",
  "Changa",
];

const ITEM_STYLES = [
  { value: "list", labelAr: "قائمة", labelEn: "List" },
  { value: "cards", labelAr: "بطاقات", labelEn: "Cards" },
  { value: "grid", labelAr: "شبكة", labelEn: "Grid" },
  { value: "compact", labelAr: "مدمج", labelEn: "Compact" },
  { value: "overlay", labelAr: "غطاء", labelEn: "Overlay" },
  { value: "magazine", labelAr: "مجلة", labelEn: "Magazine" },
];

const CATEGORY_STYLES = [
  { value: "simple", labelAr: "بسيط", labelEn: "Simple" },
  { value: "elegant", labelAr: "أنيق", labelEn: "Elegant" },
  { value: "modern", labelAr: "حديث", labelEn: "Modern" },
  { value: "accent", labelAr: "ملون", labelEn: "Accent" },
  { value: "glow", labelAr: "متوهج", labelEn: "Glow" },
  { value: "wave", labelAr: "موجي", labelEn: "Wave" },
];

const DECORATION_TYPES = [
  { value: "none", labelAr: "بدون", labelEn: "None" },
  { value: "gold-dividers", labelAr: "فواصل ذهبية", labelEn: "Gold Dividers" },
  { value: "geometric", labelAr: "هندسي", labelEn: "Geometric" },
  { value: "floral", labelAr: "زهري", labelEn: "Floral" },
  { value: "stars", labelAr: "نجوم", labelEn: "Stars" },
  { value: "waves", labelAr: "أمواج", labelEn: "Waves" },
];

const sampleItems = [
  { name: "قهوة عربية", desc: "قهوة عربية أصيلة مع الهيل", price: "15", special: true },
  { name: "شاي أخضر", desc: "شاي أخضر طازج بالنعناع", price: "12", special: false },
  { name: "لاتيه", desc: "لاتيه كريمي مع حليب الشوفان", price: "20", special: false },
];

export default function ThemeBuilderForm({ initialData }: ThemeBuilderFormProps) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(initialData?.name || "");
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "");
  const [config, setConfig] = useState<ThemeConfig>(initialData?.config || DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  const isEdit = !!initialData;

  const updateColor = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast("error", isAr ? "اسم الثيم مطلوب" : "Theme name is required");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/themes/${initialData.id}` : "/api/themes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nameAr: nameAr || null, config }),
      });

      const data = await res.json();

      if (res.ok) {
        toast("success", isEdit ? t("themeUpdated") : t("themeCreated"));
        router.push("/dashboard/themes");
      } else {
        toast("error", data.error || tc("somethingWrong"));
      }
    } catch {
      toast("error", tc("somethingWrong"));
    }
    setSaving(false);
  };

  const c = config.colors;

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/themes")}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition"
        >
          {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t("editTheme") : t("createTheme")}
        </h1>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="space-y-8">
          {/* Name */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{isAr ? "الاسم" : "Name"}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {isAr ? "الاسم (إنجليزي)" : "Name (English)"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="My Custom Theme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {isAr ? "الاسم (عربي)" : "Name (Arabic)"}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  dir="rtl"
                  placeholder="ثيم مخصص"
                />
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{isAr ? "الألوان" : "Colors"}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {COLOR_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-600">
                    {isAr ? field.labelAr : field.labelEn}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colors[field.key]}
                      onChange={(e) => updateColor(field.key, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={config.colors[field.key]}
                      onChange={(e) => updateColor(field.key, e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Font */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{isAr ? "الخط" : "Font"}</h2>
            <div className="mt-4 max-w-xs">
              <select
                value={config.fonts.body}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    fonts: { heading: e.target.value, body: e.target.value },
                    features: { ...prev.features, customFont: e.target.value !== "IBM Plex Sans Arabic" },
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Layout */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{isAr ? "التخطيط" : "Layout"}</h2>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isAr ? "تخطيط العناصر" : "Item Layout"}
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {ITEM_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        layout: { ...prev.layout, itemStyle: style.value },
                      }))
                    }
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      config.layout.itemStyle === style.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {isAr ? style.labelAr : style.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isAr ? "تخطيط التصنيفات" : "Category Style"}
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {CATEGORY_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        layout: { ...prev.layout, categoryStyle: style.value },
                      }))
                    }
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      config.layout.categoryStyle === style.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {isAr ? style.labelAr : style.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Decoration */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{isAr ? "الزخرفة" : "Decoration"}</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {DECORATION_TYPES.map((dec) => (
                <button
                  key={dec.value}
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      decoration: { ...prev.decoration, type: dec.value },
                      features: { ...prev.features, showDecorations: dec.value !== "none" },
                    }))
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    config.decoration.type === dec.value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {isAr ? dec.labelAr : dec.labelEn}
                </button>
              ))}
            </div>
            {config.decoration.type !== "none" && (
              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  {isAr ? "لون الزخرفة" : "Decoration Color"}
                </label>
                <input
                  type="color"
                  value={config.decoration.color}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      decoration: { ...prev.decoration, color: e.target.value },
                    }))
                  }
                  className="h-8 w-8 cursor-pointer rounded border border-gray-300"
                />
              </div>
            )}
          </section>

          {/* Features */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{isAr ? "المميزات" : "Features"}</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.features.showPhotos}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      features: { ...prev.features, showPhotos: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{isAr ? "عرض الصور" : "Show Photos"}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.features.showDecorations}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      features: { ...prev.features, showDecorations: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{isAr ? "عرض الزخارف" : "Show Decorations"}</span>
              </label>
            </div>
          </section>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : tc("save")}
          </button>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {isAr ? "معاينة مباشرة" : "Live Preview"}
              </h3>
            </div>
            <div className="p-4" style={{ backgroundColor: c.background }}>
              {/* Decoration hint */}
              {config.decoration.type !== "none" && config.features.showDecorations && (
                <div className="mb-3 flex items-center justify-center gap-1">
                  <span className="text-[9px]" style={{ color: c.textSecondary }}>
                    {config.decoration.type === "gold-dividers" && "فواصل ذهبية"}
                    {config.decoration.type === "geometric" && "نقاط هندسية"}
                    {config.decoration.type === "floral" && "زخارف زهرية"}
                    {config.decoration.type === "stars" && "نجوم متناثرة"}
                    {config.decoration.type === "waves" && "أمواج"}
                  </span>
                </div>
              )}

              {/* Category heading */}
              <PreviewCategoryHeading
                style={config.layout.categoryStyle}
                colors={c}
                decorationColor={config.decoration.color}
              />

              {/* Items */}
              <PreviewItems
                style={config.layout.itemStyle}
                colors={c}
                items={sampleItems}
                showPhotos={config.features.showPhotos}
              />

              {/* Font bar */}
              {config.fonts.body !== "IBM Plex Sans Arabic" && (
                <div className="mt-3 rounded-lg border px-3 py-1.5 text-center" style={{ borderColor: c.border, backgroundColor: c.surface }}>
                  <span className="text-[9px]" style={{ color: c.textSecondary }}>
                    {isAr ? "خط" : "Font"}: {config.fonts.body}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Preview sub-components ─── */

function PreviewCategoryHeading({
  style,
  colors: c,
  decorationColor,
}: {
  style: string;
  colors: Record<string, string>;
  decorationColor: string;
}) {
  const heading = "المشروبات الساخنة";
  switch (style) {
    case "elegant":
      return (
        <div className="mb-3 text-center">
          <div className="mx-auto mb-1 h-px w-8" style={{ backgroundColor: decorationColor }} />
          <h3 className="text-sm font-bold" style={{ color: c.text }}>{heading}</h3>
          <div className="mx-auto mt-1 h-px w-8" style={{ backgroundColor: decorationColor }} />
        </div>
      );
    case "modern":
      return (
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-0.5 rounded-full" style={{ backgroundColor: c.primary }} />
          <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: c.text }}>{heading}</h3>
        </div>
      );
    case "accent":
      return (
        <div className="mb-3">
          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ backgroundColor: c.primary }}>
            {heading}
          </span>
        </div>
      );
    case "glow":
      return (
        <div className="mb-3 text-center">
          <h3 className="text-sm font-bold" style={{ color: c.primary, textShadow: `0 0 12px ${c.primary}40` }}>
            {heading}
          </h3>
        </div>
      );
    case "wave":
      return (
        <div className="mb-3">
          <h3 className="text-sm font-bold" style={{ color: c.text }}>{heading}</h3>
          <svg viewBox="0 0 200 8" className="mt-1 w-full" style={{ height: "6px" }} preserveAspectRatio="none">
            <path d="M0 4 Q25 0 50 4 T100 4 T150 4 T200 4" stroke={decorationColor} strokeWidth="1" fill="none" opacity="0.3" />
          </svg>
        </div>
      );
    default:
      return (
        <h3 className="mb-3 text-sm font-bold" style={{ color: c.text }} dir="rtl">{heading}</h3>
      );
  }
}

function PreviewItems({
  style,
  colors: c,
  items,
  showPhotos,
}: {
  style: string;
  colors: Record<string, string>;
  items: typeof sampleItems;
  showPhotos: boolean;
}) {
  switch (style) {
    case "cards":
      return (
        <div className="space-y-2" dir="rtl">
          {items.map((item) => (
            <div key={item.name} className="flex gap-2 rounded-lg p-2.5" style={{ backgroundColor: c.surface, boxShadow: `0 1px 6px ${c.border}40` }}>
              {showPhotos && <div className="h-12 w-12 shrink-0 rounded-lg" style={{ backgroundColor: c.primary + "15" }} />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: c.text }}>{item.name}</span>
                  {item.special && <span className="rounded-full px-1 py-px text-[8px] font-bold" style={{ backgroundColor: c.special + "20", color: c.special }}>مميز</span>}
                </div>
                <p className="mt-0.5 text-[10px]" style={{ color: c.textSecondary }}>{item.desc}</p>
                <span className="mt-1 inline-block text-xs font-bold" style={{ color: c.price }}>{item.price} SAR</span>
              </div>
            </div>
          ))}
        </div>
      );

    case "grid":
      return (
        <div className="grid grid-cols-2 gap-2" dir="rtl">
          {items.slice(0, 2).map((item) => (
            <div key={item.name} className="overflow-hidden rounded-lg" style={{ border: `1px solid ${c.border}` }}>
              {showPhotos && <div className="h-14" style={{ backgroundColor: c.primary + "12" }} />}
              <div className="p-2" style={{ backgroundColor: c.surface }}>
                <span className="text-[10px] font-semibold" style={{ color: c.text }}>{item.name}</span>
                <p className="mt-0.5 text-[8px]" style={{ color: c.textSecondary }}>{item.desc}</p>
                <span className="mt-1 inline-block text-[10px] font-bold" style={{ color: c.price }}>{item.price} SAR</span>
              </div>
            </div>
          ))}
        </div>
      );

    case "compact":
      return (
        <div className="space-y-1.5" dir="rtl">
          {items.map((item) => (
            <div key={item.name} className="flex items-center gap-2 rounded-md py-1.5 ps-2 pe-2" style={{ borderInlineStart: `2px solid ${item.special ? c.special : c.primary}`, backgroundColor: c.surface }}>
              {showPhotos && <div className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: c.primary + "15" }} />}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold" style={{ color: c.text }}>{item.name}</span>
                <p className="truncate text-[8px]" style={{ color: c.textSecondary }}>{item.desc}</p>
              </div>
              <span className="text-[10px] font-bold" style={{ color: c.price }}>{item.price} SAR</span>
            </div>
          ))}
        </div>
      );

    case "overlay":
      return (
        <div className="space-y-2" dir="rtl">
          {items.slice(0, 2).map((item) => (
            <div key={item.name} className="relative overflow-hidden rounded-lg" style={{ height: "56px" }}>
              <div className="absolute inset-0" style={{ backgroundColor: c.primary + "20" }} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.background}ee, transparent)` }} />
              <div className="absolute inset-x-0 bottom-0 p-2">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold" style={{ color: c.text }}>{item.name}</span>
                    <p className="text-[8px]" style={{ color: c.textSecondary }}>{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: c.price }}>{item.price} SAR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "magazine":
      return (
        <div className="space-y-2" dir="rtl">
          <div className="overflow-hidden rounded-lg" style={{ backgroundColor: c.surface }}>
            {showPhotos && <div className="h-14" style={{ backgroundColor: c.primary + "12" }} />}
            <div className="p-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: c.text }}>{items[0].name}</span>
                <span className="rounded-full px-1 py-px text-[8px] font-bold" style={{ backgroundColor: c.special + "20", color: c.special }}>مميز</span>
              </div>
              <p className="mt-0.5 text-[8px]" style={{ color: c.textSecondary }}>{items[0].desc}</p>
              <span className="mt-1 inline-block text-[10px] font-bold" style={{ color: c.price }}>{items[0].price} SAR</span>
            </div>
          </div>
          {items.slice(1).map((item) => (
            <div key={item.name} className="flex gap-2 rounded-md p-2" style={{ backgroundColor: c.surface }}>
              {showPhotos && <div className="h-8 w-8 shrink-0 rounded" style={{ backgroundColor: c.primary + "15" }} />}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold" style={{ color: c.text }}>{item.name}</span>
                <span className="ms-2 text-[10px] font-bold" style={{ color: c.price }}>{item.price} SAR</span>
              </div>
            </div>
          ))}
        </div>
      );

    default: // list
      return (
        <div className="space-y-0" dir="rtl">
          {items.map((item) => (
            <div key={item.name} className="flex items-start justify-between border-b py-2" style={{ borderColor: c.border }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: c.text }}>{item.name}</span>
                  {item.special && <span className="rounded-full px-1 py-px text-[8px] font-bold" style={{ backgroundColor: c.special + "20", color: c.special }}>مميز</span>}
                </div>
                <p className="mt-0.5 text-[10px]" style={{ color: c.textSecondary }}>{item.desc}</p>
              </div>
              <span className="text-xs font-bold whitespace-nowrap ms-3" style={{ color: c.price }}>{item.price} SAR</span>
            </div>
          ))}
        </div>
      );
  }
}
