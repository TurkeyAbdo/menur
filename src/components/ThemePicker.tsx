"use client";

import { Check, Star, Image, Palette, Type } from "lucide-react";

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
  price: string;
  unavailable: string;
  special: string;
}

interface ThemeConfig {
  colors: ThemeColors;
  fonts?: { heading?: string; body?: string };
  layout?: { itemStyle?: string; categoryStyle?: string };
  decoration?: { type?: string; color?: string };
  features?: { showPhotos?: boolean; showDecorations?: boolean; customFont?: boolean };
}

export interface ThemeOption {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  isFree: boolean;
  config: ThemeConfig | null;
}

interface ThemePickerProps {
  themes: ThemeOption[];
  selectedTheme: string;
  onSelect: (id: string) => void;
  label: string;
}

const LAYOUT_LABELS: Record<string, string> = {
  list: "قائمة",
  cards: "بطاقات",
  grid: "شبكة",
  compact: "مدمج",
  overlay: "غطاء",
  magazine: "مجلة",
};

/* ─── Mini Mockup per layout style ─── */
function MiniMockup({ config }: { config: ThemeConfig }) {
  const c = config.colors;
  const style = config.layout?.itemStyle || "list";

  switch (style) {
    case "cards":
      return (
        <div className="space-y-1.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-1.5 rounded-md p-1.5"
              style={{ backgroundColor: c.surface, boxShadow: `0 1px 4px ${c.border}50` }}
            >
              <div className="h-6 w-6 shrink-0 rounded" style={{ backgroundColor: c.primary + "20" }} />
              <div className="flex-1">
                <div className="h-1.5 w-10 rounded-sm" style={{ backgroundColor: c.text, opacity: 0.7 }} />
                <div className="mt-1 h-1 w-7 rounded-sm" style={{ backgroundColor: c.price }} />
              </div>
            </div>
          ))}
        </div>
      );

    case "grid":
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-md" style={{ border: `1px solid ${c.border}` }}>
              <div className="h-5" style={{ backgroundColor: c.primary + "15" }} />
              <div className="p-1" style={{ backgroundColor: c.surface }}>
                <div className="h-1.5 w-8 rounded-sm" style={{ backgroundColor: c.text, opacity: 0.7 }} />
                <div className="mt-1 h-1 w-5 rounded-sm" style={{ backgroundColor: c.price }} />
              </div>
            </div>
          ))}
        </div>
      );

    case "compact":
      return (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded py-0.5 ps-1"
              style={{ borderInlineStart: `2px solid ${c.primary}`, backgroundColor: c.surface }}
            >
              <div className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: c.primary + "20" }} />
              <div className="flex-1">
                <div className="h-1.5 w-8 rounded-sm" style={{ backgroundColor: c.text, opacity: 0.7 }} />
              </div>
              <div className="h-1 w-4 rounded-sm me-1" style={{ backgroundColor: c.price }} />
            </div>
          ))}
        </div>
      );

    case "overlay":
      return (
        <div className="space-y-1.5">
          <div className="relative overflow-hidden rounded-md" style={{ height: "32px" }}>
            <div className="absolute inset-0" style={{ backgroundColor: c.primary + "30" }} />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${c.background}dd, transparent)` }}
            />
            <div className="absolute inset-x-0 bottom-0 p-1">
              <div className="h-1.5 w-10 rounded-sm" style={{ backgroundColor: c.text, opacity: 0.8 }} />
              <div className="mt-0.5 h-1 w-5 rounded-sm" style={{ backgroundColor: c.price }} />
            </div>
          </div>
        </div>
      );

    case "magazine":
      return (
        <div className="space-y-1.5">
          <div className="overflow-hidden rounded-md" style={{ backgroundColor: c.surface }}>
            <div className="h-6" style={{ backgroundColor: c.primary + "15" }} />
            <div className="p-1">
              <div className="h-1.5 w-12 rounded-sm" style={{ backgroundColor: c.text, opacity: 0.7 }} />
              <div className="mt-0.5 h-1 w-6 rounded-sm" style={{ backgroundColor: c.price }} />
            </div>
          </div>
          <div className="flex gap-1 rounded-md p-1" style={{ backgroundColor: c.surface }}>
            <div className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: c.primary + "20" }} />
            <div className="flex-1">
              <div className="h-1.5 w-8 rounded-sm" style={{ backgroundColor: c.text, opacity: 0.7 }} />
              <div className="mt-0.5 h-1 w-5 rounded-sm" style={{ backgroundColor: c.price }} />
            </div>
          </div>
        </div>
      );

    default: // list
      return (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b py-1"
              style={{ borderColor: c.border }}
            >
              <div>
                <div className="h-1.5 w-12 rounded-sm" style={{ backgroundColor: c.text, opacity: 0.7 }} />
                <div className="mt-0.5 h-1 w-8 rounded-sm" style={{ backgroundColor: c.textSecondary }} />
              </div>
              <div className="h-1.5 w-6 rounded-sm" style={{ backgroundColor: c.price }} />
            </div>
          ))}
        </div>
      );
  }
}

/* ─── Feature badges for the card ─── */
function FeatureBadges({ config }: { config: ThemeConfig }) {
  const features = config.features;
  if (!features) return null;

  return (
    <div className="flex gap-1">
      {features.showPhotos && (
        <span className="flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-0.5 text-[8px] text-emerald-600">
          <Image className="h-2 w-2" /> صور
        </span>
      )}
      {features.showDecorations && (
        <span className="flex items-center gap-0.5 rounded bg-purple-50 px-1 py-0.5 text-[8px] text-purple-600">
          <Palette className="h-2 w-2" /> زخارف
        </span>
      )}
      {features.customFont && (
        <span className="flex items-center gap-0.5 rounded bg-blue-50 px-1 py-0.5 text-[8px] text-blue-600">
          <Type className="h-2 w-2" /> خط
        </span>
      )}
    </div>
  );
}

/* ─── Preview Panel: layout-aware ─── */
function PreviewPanel({ config }: { config: ThemeConfig }) {
  const c = config.colors;
  const itemStyle = config.layout?.itemStyle || "list";
  const showPhotos = config.features?.showPhotos;
  const categoryStyle = config.layout?.categoryStyle || "simple";
  const decorationType = config.decoration?.type || "none";
  const decorationColor = config.decoration?.color || c.primary;

  const sampleItems = [
    { name: "قهوة عربية", desc: "قهوة عربية أصيلة مع الهيل", price: "15", special: true },
    { name: "شاي أخضر", desc: "شاي أخضر طازج بالنعناع", price: "12", special: false },
    { name: "لاتيه", desc: "لاتيه كريمي مع حليب الشوفان", price: "20", special: false },
  ];

  // Category heading
  const renderCategoryHeading = () => {
    const heading = "المشروبات الساخنة";
    switch (categoryStyle) {
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
            <h3
              className="text-sm font-bold"
              style={{ color: c.primary, textShadow: `0 0 12px ${c.primary}40` }}
            >
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
          <h3 className="mb-3 text-sm font-bold" style={{ color: c.text }} dir="rtl">
            {heading}
          </h3>
        );
    }
  };

  // Render items based on style
  const renderPreviewItems = () => {
    switch (itemStyle) {
      case "cards":
        return (
          <div className="space-y-2">
            {sampleItems.map((item) => (
              <div
                key={item.name}
                className="flex gap-2 rounded-lg p-2.5"
                style={{ backgroundColor: c.surface, boxShadow: `0 1px 6px ${c.border}40` }}
              >
                {showPhotos && (
                  <div className="h-12 w-12 shrink-0 rounded-lg" style={{ backgroundColor: c.primary + "15" }} />
                )}
                <div className="min-w-0 flex-1" dir="rtl">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: c.text }}>{item.name}</span>
                    {item.special && (
                      <span className="rounded-full px-1 py-px text-[8px] font-bold" style={{ backgroundColor: c.special + "20", color: c.special }}>
                        مميز
                      </span>
                    )}
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
            {sampleItems.slice(0, 2).map((item) => (
              <div key={item.name} className="overflow-hidden rounded-lg" style={{ border: `1px solid ${c.border}` }}>
                {showPhotos && (
                  <div className="h-14" style={{ backgroundColor: c.primary + "12" }} />
                )}
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
            {sampleItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 rounded-md py-1.5 ps-2 pe-2"
                style={{ borderInlineStart: `2px solid ${item.special ? c.special : c.primary}`, backgroundColor: c.surface }}
              >
                {showPhotos && (
                  <div className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: c.primary + "15" }} />
                )}
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
            {sampleItems.slice(0, 2).map((item) => (
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
            {/* Featured item */}
            <div className="overflow-hidden rounded-lg" style={{ backgroundColor: c.surface }}>
              {showPhotos && (
                <div className="h-14" style={{ backgroundColor: c.primary + "12" }} />
              )}
              <div className="p-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: c.text }}>{sampleItems[0].name}</span>
                  <span className="rounded-full px-1 py-px text-[8px] font-bold" style={{ backgroundColor: c.special + "20", color: c.special }}>مميز</span>
                </div>
                <p className="mt-0.5 text-[8px]" style={{ color: c.textSecondary }}>{sampleItems[0].desc}</p>
                <span className="mt-1 inline-block text-[10px] font-bold" style={{ color: c.price }}>{sampleItems[0].price} SAR</span>
              </div>
            </div>
            {/* Small items */}
            {sampleItems.slice(1).map((item) => (
              <div key={item.name} className="flex gap-2 rounded-md p-2" style={{ backgroundColor: c.surface }}>
                {showPhotos && (
                  <div className="h-8 w-8 shrink-0 rounded" style={{ backgroundColor: c.primary + "15" }} />
                )}
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
            {sampleItems.map((item) => (
              <div
                key={item.name}
                className="flex items-start justify-between border-b py-2"
                style={{ borderColor: c.border }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: c.text }}>{item.name}</span>
                    {item.special && (
                      <span className="rounded-full px-1 py-px text-[8px] font-bold" style={{ backgroundColor: c.special + "20", color: c.special }}>
                        مميز
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px]" style={{ color: c.textSecondary }}>{item.desc}</p>
                </div>
                <span className="text-xs font-bold whitespace-nowrap ms-3" style={{ color: c.price }}>
                  {item.price} SAR
                </span>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: c.border }}>
      <div style={{ backgroundColor: c.background }} className="p-4">
        {/* Decoration hint */}
        {decorationType !== "none" && (
          <div className="mb-2 flex items-center justify-center gap-1">
            <Palette className="h-3 w-3" style={{ color: decorationColor + "80" }} />
            <span className="text-[9px]" style={{ color: c.textSecondary }}>
              {decorationType === "gold-dividers" && "فواصل ذهبية"}
              {decorationType === "geometric" && "نقاط هندسية"}
              {decorationType === "floral" && "زخارف زهرية"}
              {decorationType === "stars" && "نجوم متناثرة"}
              {decorationType === "waves" && "أمواج"}
            </span>
          </div>
        )}
        {renderCategoryHeading()}
        {renderPreviewItems()}
      </div>
      {/* Font info bar */}
      {config.fonts?.body && config.fonts.body !== "IBM Plex Sans Arabic" && (
        <div className="border-t px-3 py-1.5 text-center" style={{ borderColor: c.border, backgroundColor: c.surface }}>
          <span className="text-[9px]" style={{ color: c.textSecondary }}>
            <Type className="inline h-2.5 w-2.5 me-1" />
            خط: {config.fonts.body}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main ThemePicker ─── */
export default function ThemePicker({
  themes,
  selectedTheme,
  onSelect,
  label,
}: ThemePickerProps) {
  const selected = themes.find((t) => t.id === selectedTheme);
  const selectedConfig = selected?.config;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Theme grid */}
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {themes.map((theme) => {
          const config = theme.config;
          const c = config?.colors;
          const isSelected = selectedTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelect(theme.id)}
              className={`relative overflow-hidden rounded-xl border-2 p-0 text-start transition ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-600/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Mini mockup */}
              <div
                className="relative p-3"
                style={{ backgroundColor: c?.background ?? "#f9fafb" }}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}

                {/* PRO badge */}
                {!theme.isFree && (
                  <span className="absolute top-1.5 start-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                    PRO
                  </span>
                )}

                {/* Layout mini mockup */}
                <div className="mt-3">
                  {config ? (
                    <MiniMockup config={config} />
                  ) : (
                    <div
                      className="rounded-lg p-2.5"
                      style={{
                        backgroundColor: c?.surface ?? "#ffffff",
                        border: `1px solid ${c?.border ?? "#e5e7eb"}`,
                      }}
                    >
                      <div className="h-2 w-16 rounded-sm" style={{ backgroundColor: c?.text ?? "#111827", opacity: 0.8 }} />
                      <div className="mt-1.5 h-1.5 w-10 rounded-sm" style={{ backgroundColor: c?.textSecondary ?? "#6b7280" }} />
                      <div className="mt-2 flex items-center justify-between">
                        <div className="h-1.5 w-8 rounded-sm" style={{ backgroundColor: c?.price ?? "#059669" }} />
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c?.special ?? "#f59e0b", opacity: 0.8 }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name + layout label + feature badges */}
              <div className="border-t border-gray-100 bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {theme.nameAr || theme.name}
                  </p>
                  {config?.layout?.itemStyle && (
                    <span className="shrink-0 rounded bg-gray-100 px-1 py-0.5 text-[8px] text-gray-500">
                      {LAYOUT_LABELS[config.layout.itemStyle] || config.layout.itemStyle}
                    </span>
                  )}
                </div>
                {config && (
                  <div className="mt-1">
                    <FeatureBadges config={config} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live preview panel */}
      {selectedConfig && <PreviewPanel config={selectedConfig} />}
    </div>
  );
}
