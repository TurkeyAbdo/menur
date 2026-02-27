"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  Heart,
  Send,
  Loader2,
  X,
} from "lucide-react";

interface Variant {
  name: string;
  nameAr: string | null;
  priceModifier: number;
}

interface MenuItem {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: number;
  currency: string;
  photo: string | null;
  allergens: string[];
  dietaryTags: string[];
  availability: string;
  isSpecial: boolean;
  timeSlot: string;
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  items: MenuItem[];
}

interface Restaurant {
  name: string;
  nameAr: string | null;
  logo: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  snapchat: string | null;
  locations: {
    name: string;
    nameAr: string | null;
    address: string;
    addressAr: string | null;
    phone: string | null;
    openingHours: Record<string, { open: string; close: string }> | null;
  }[];
}

interface FeedbackData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Props {
  restaurant: Restaurant;
  menu: {
    id: string;
    name: string;
    nameAr: string | null;
    layout: string;
    categories: Category[];
  };
  theme: Record<string, Record<string, string>>;
  showBadge?: boolean;
  slug: string;
  qrCodeId?: string;
}

/* ─── Constants ─── */

const ALLERGEN_EMOJIS: Record<string, string> = {
  gluten: "\u{1F33E}",
  dairy: "\u{1F95B}",
  nuts: "\u{1F95C}",
  shellfish: "\u{1F990}",
  eggs: "\u{1F95A}",
  fish: "\u{1F41F}",
  soy: "\u{1FAD8}",
  sesame: "\u26AA",
};

const ALLERGEN_NAMES: Record<string, Record<string, string>> = {
  ar: {
    gluten: "جلوتين",
    dairy: "ألبان",
    nuts: "مكسرات",
    shellfish: "محار",
    eggs: "بيض",
    fish: "سمك",
    soy: "صويا",
    sesame: "سمسم",
  },
  en: {
    gluten: "Gluten",
    dairy: "Dairy",
    nuts: "Nuts",
    shellfish: "Shellfish",
    eggs: "Eggs",
    fish: "Fish",
    soy: "Soy",
    sesame: "Sesame",
  },
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    searchPlaceholder: "ابحث في القائمة...",
    all: "الكل",
    favorites: "المفضلة",
    special: "عرض خاص",
    unavailable: "غير متاح مؤقتاً",
    noFavorites: "لا توجد مفضلات بعد. اضغط على أيقونة القلب لحفظ العناصر.",
    rateExperience: "قيّم تجربتك",
    thanksFeedback: "شكراً على تقييمك!",
    leaveComment: "اترك تعليقاً (اختياري)...",
    submitRating: "إرسال التقييم",
    submitting: "جاري الإرسال...",
    website: "الموقع",
    saved: "تم الحفظ",
    addToFavorites: "حفظ في المفضلة",
  },
  en: {
    searchPlaceholder: "Search menu...",
    all: "All",
    favorites: "Favorites",
    special: "Special",
    unavailable: "Temporarily unavailable",
    noFavorites: "No favorites yet. Tap the heart icon to save items.",
    rateExperience: "Rate your experience",
    thanksFeedback: "Thanks for your rating!",
    leaveComment: "Leave a comment (optional)...",
    submitRating: "Submit rating",
    submitting: "Submitting...",
    website: "Website",
    saved: "Saved",
    addToFavorites: "Add to favorites",
  },
};

const getDietaryLabels = (lang: string): Record<string, string> => ({
  halal: lang === "ar" ? "حلال" : "Halal",
  vegan: lang === "ar" ? "نباتي" : "Vegan",
  vegetarian: lang === "ar" ? "نباتي+" : "Vegetarian",
  "gluten-free": lang === "ar" ? "خالي من الجلوتين" : "Gluten-free",
  "sugar-free": lang === "ar" ? "خالي من السكر" : "Sugar-free",
  spicy: lang === "ar" ? "\u{1F336}\uFE0F حار" : "\u{1F336}\uFE0F Spicy",
});

interface ItemRenderCtx {
  lang: string;
  dietaryLabels: Record<string, string>;
  t: Record<string, string>;
  dn: (nameAr: string | null, name: string) => string;
  dd: (descAr: string | null, desc: string | null) => string | null;
  onItemClick: (item: MenuItem) => void;
}

// Google Fonts URL map for PRO themes
const GOOGLE_FONT_URLS: Record<string, string> = {
  Amiri:
    "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap",
  Cairo:
    "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap",
  Tajawal:
    "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap",
  "Noto Kufi Arabic":
    "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap",
  Changa:
    "https://fonts.googleapis.com/css2?family=Changa:wght@400;600;700&display=swap",
};

/* ─── Decoration Components ─── */
function GoldDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-px flex-1" style={{ backgroundColor: color + "40" }} />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L14.5 9.5H22L16 14L18 22L12 17.5L6 22L8 14L2 9.5H9.5L12 2Z"
          fill={color}
          opacity="0.6"
        />
      </svg>
      <div className="h-px flex-1" style={{ backgroundColor: color + "40" }} />
    </div>
  );
}

function GeometricPattern({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]"
      aria-hidden="true"
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="geo-dots"
            x="0"
            y="0"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="15" cy="15" r="2" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo-dots)" />
      </svg>
    </div>
  );
}

function FloralCorners({ color }: { color: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute top-0 start-0 h-16 w-16 opacity-10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 64" fill="none">
          <path
            d="M0 0C0 0 20 5 32 32C5 20 0 0 0 0Z"
            fill={color}
          />
          <circle cx="8" cy="8" r="3" fill={color} opacity="0.5" />
        </svg>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 end-0 h-16 w-16 rotate-180 opacity-10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 64" fill="none">
          <path
            d="M0 0C0 0 20 5 32 32C5 20 0 0 0 0Z"
            fill={color}
          />
          <circle cx="8" cy="8" r="3" fill={color} opacity="0.5" />
        </svg>
      </div>
    </>
  );
}

function StarsDecoration({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]"
      aria-hidden="true"
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="stars-pat"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <text x="15" y="20" fontSize="8" fill={color}>
              &#x2726;
            </text>
            <text x="45" y="45" fontSize="6" fill={color}>
              &#x2726;
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars-pat)" />
      </svg>
    </div>
  );
}

function WaveDivider({ color }: { color: string }) {
  return (
    <div className="py-3">
      <svg
        viewBox="0 0 400 20"
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: "12px" }}
      >
        <path
          d="M0 10 Q50 0 100 10 T200 10 T300 10 T400 10"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

/* ─── Category Header Variants ─── */
function CategoryHeader({
  cat,
  style,
  colors,
  decorationColor,
  dn,
  dd,
}: {
  cat: Category;
  style: string;
  colors: Record<string, string>;
  decorationColor?: string;
  dn: (nameAr: string | null, name: string) => string;
  dd: (descAr: string | null, desc: string | null) => string | null;
}) {
  const name = dn(cat.nameAr, cat.name);
  const desc = dd(cat.descriptionAr, cat.description);

  switch (style) {
    case "elegant":
      return (
        <div className="mb-6 text-center">
          {decorationColor && (
            <div className="mx-auto mb-2 h-px w-12" style={{ backgroundColor: decorationColor }} />
          )}
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
            {name}
          </h2>
          {desc && (
            <p className="mt-1.5 text-sm" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
          {decorationColor && (
            <div className="mx-auto mt-2 h-px w-12" style={{ backgroundColor: decorationColor }} />
          )}
        </div>
      );

    case "modern":
      return (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full" style={{ backgroundColor: colors.primary }} />
            <h2 className="text-xl font-bold uppercase tracking-wide" style={{ color: colors.text }}>
              {name}
            </h2>
          </div>
          {desc && (
            <p className="mt-1.5 text-sm ps-4" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
        </div>
      );

    case "accent":
      return (
        <div className="mb-5">
          <h2
            className="inline-block rounded-full px-4 py-1.5 text-sm font-bold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            {name}
          </h2>
          {desc && (
            <p className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
        </div>
      );

    case "glow":
      return (
        <div className="mb-6 text-center">
          <h2
            className="text-xl font-bold"
            style={{ color: colors.primary, textShadow: `0 0 20px ${colors.primary}40` }}
          >
            {name}
          </h2>
          {desc && (
            <p className="mt-1.5 text-sm" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
        </div>
      );

    case "wave":
      return (
        <div className="mb-5">
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            {name}
          </h2>
          {desc && (
            <p className="mt-1.5 text-sm" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
          {decorationColor && <WaveDivider color={decorationColor} />}
        </div>
      );

    default: // "simple"
      return (
        <div className="mb-5">
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
            {name}
          </h2>
          {desc && (
            <p className="mt-1.5 text-sm" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
        </div>
      );
  }
}

/* ─── Shared sub-components ─── */
function ItemBadges({
  item,
  colors,
  dietaryLabels,
}: {
  item: MenuItem;
  colors: Record<string, string>;
  dietaryLabels: Record<string, string>;
}) {
  return (
    <>
      {item.allergens.length > 0 && (
        <div className="mt-2 flex gap-1">
          {item.allergens.map((a) => (
            <span key={a} className="text-sm" title={a}>
              {ALLERGEN_EMOJIS[a] || a}
            </span>
          ))}
        </div>
      )}
      {item.dietaryTags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {item.dietaryTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: colors.accent + "20",
                color: colors.accent,
              }}
            >
              {dietaryLabels[tag] || tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function PriceRow({
  item,
  colors,
  dn,
}: {
  item: MenuItem;
  colors: Record<string, string>;
  dn: (nameAr: string | null, name: string) => string;
}) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="text-base font-bold" style={{ color: colors.price }}>
        {item.price} {item.currency}
      </span>
      {item.variants.map((v, i) => (
        <span key={i} className="text-xs" style={{ color: colors.textSecondary }}>
          {dn(v.nameAr, v.name)}: +{v.priceModifier} {item.currency}
        </span>
      ))}
    </div>
  );
}

function SpecialBadge({
  colors,
  label,
}: {
  colors: Record<string, string>;
  label: string;
}) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: colors.special + "20",
        color: colors.special,
      }}
    >
      <Star className="inline h-3 w-3" /> {label}
    </span>
  );
}

function UnavailableBadge({
  colors,
  label,
}: {
  colors: Record<string, string>;
  label: string;
}) {
  return (
    <span
      className="mt-1 inline-block text-xs font-medium"
      style={{ color: colors.unavailable }}
    >
      {label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   ITEM RENDER FUNCTIONS — one per layout style
   ────────────────────────────────────────────────────────────── */

// ── LIST (free): simple text rows, no photos ──
function renderItemList(
  item: MenuItem,
  colors: Record<string, string>,
  _showPhotos: boolean,
  toggleFavorite: (id: string) => void,
  favorites: string[],
  ctx: ItemRenderCtx
) {
  return (
    <div
      key={item.id}
      className="flex items-start justify-between gap-3 border-b py-3 cursor-pointer transition-all duration-200"
      style={{
        borderColor: colors.border,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
      onClick={() => ctx.onItemClick(item)}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold" style={{ color: colors.text }}>
            {ctx.dn(item.nameAr, item.name)}
          </h3>
          {item.isSpecial && <SpecialBadge colors={colors} label={ctx.t.special} />}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            className="ms-auto shrink-0"
          >
            <Heart
              className={`h-4 w-4 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
            />
          </button>
        </div>
        {item.name && item.nameAr && (
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            {ctx.lang === "ar" ? item.name : item.nameAr}
          </p>
        )}
        {ctx.dd(item.descriptionAr, item.description) && (
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            {ctx.dd(item.descriptionAr, item.description)}
          </p>
        )}
        <ItemBadges item={item} colors={colors} dietaryLabels={ctx.dietaryLabels} />
        <PriceRow item={item} colors={colors} dn={ctx.dn} />
        {item.availability === "UNAVAILABLE" && (
          <UnavailableBadge colors={colors} label={ctx.t.unavailable} />
        )}
      </div>
    </div>
  );
}

// ── CARDS (Elegant): rich cards with photos, soft shadows ──
function renderItemCards(
  item: MenuItem,
  colors: Record<string, string>,
  showPhotos: boolean,
  toggleFavorite: (id: string) => void,
  favorites: string[],
  ctx: ItemRenderCtx
) {
  return (
    <div
      key={item.id}
      className="flex gap-4 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        backgroundColor: colors.surface,
        boxShadow: `0 4px 20px ${colors.border}30`,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
      onClick={() => ctx.onItemClick(item)}
    >
      {showPhotos && item.photo && (
        <Image
          src={item.photo}
          alt={ctx.dn(item.nameAr, item.name)}
          width={112}
          height={112}
          className="h-28 w-28 shrink-0 rounded-xl object-cover"
          loading="lazy"
          unoptimized
        />
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" style={{ color: colors.text }}>
                {ctx.dn(item.nameAr, item.name)}
              </h3>
              {item.isSpecial && <SpecialBadge colors={colors} label={ctx.t.special} />}
            </div>
            {item.name && item.nameAr && (
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {ctx.lang === "ar" ? item.name : item.nameAr}
              </p>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}>
            <Heart
              className={`h-5 w-5 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
            />
          </button>
        </div>
        {ctx.dd(item.descriptionAr, item.description) && (
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            {ctx.dd(item.descriptionAr, item.description)}
          </p>
        )}
        <ItemBadges item={item} colors={colors} dietaryLabels={ctx.dietaryLabels} />
        <PriceRow item={item} colors={colors} dn={ctx.dn} />
        {item.availability === "UNAVAILABLE" && (
          <UnavailableBadge colors={colors} label={ctx.t.unavailable} />
        )}
      </div>
    </div>
  );
}

// ── GRID (Modern): 2-column grid, photo on top ──
function renderItemGrid(
  item: MenuItem,
  colors: Record<string, string>,
  showPhotos: boolean,
  toggleFavorite: (id: string) => void,
  favorites: string[],
  ctx: ItemRenderCtx
) {
  return (
    <div
      key={item.id}
      className="overflow-hidden rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
      onClick={() => ctx.onItemClick(item)}
    >
      {showPhotos && item.photo && (
        <Image
          src={item.photo}
          alt={ctx.dn(item.nameAr, item.name)}
          width={400}
          height={144}
          className="h-36 w-full object-cover"
          loading="lazy"
          unoptimized
        />
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
            {ctx.dn(item.nameAr, item.name)}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            className="shrink-0"
          >
            <Heart
              className={`h-4 w-4 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
            />
          </button>
        </div>
        {item.isSpecial && (
          <div className="mt-1">
            <SpecialBadge colors={colors} label={ctx.t.special} />
          </div>
        )}
        {ctx.dd(item.descriptionAr, item.description) && (
          <p className="mt-1 text-xs line-clamp-2" style={{ color: colors.textSecondary }}>
            {ctx.dd(item.descriptionAr, item.description)}
          </p>
        )}
        <ItemBadges item={item} colors={colors} dietaryLabels={ctx.dietaryLabels} />
        <div className="mt-2">
          <span className="text-sm font-bold" style={{ color: colors.price }}>
            {item.price} {item.currency}
          </span>
        </div>
        {item.availability === "UNAVAILABLE" && (
          <UnavailableBadge colors={colors} label={ctx.t.unavailable} />
        )}
      </div>
    </div>
  );
}

// ── COMPACT (Rose): tight rows with accent border + small thumbnail ──
function renderItemCompact(
  item: MenuItem,
  colors: Record<string, string>,
  showPhotos: boolean,
  toggleFavorite: (id: string) => void,
  favorites: string[],
  ctx: ItemRenderCtx
) {
  return (
    <div
      key={item.id}
      className="flex items-center gap-3 rounded-lg border-s-[3px] py-2.5 ps-3 pe-2 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        borderColor: item.isSpecial ? colors.special : colors.primary,
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
      onClick={() => ctx.onItemClick(item)}
    >
      {showPhotos && item.photo && (
        <Image
          src={item.photo}
          alt={ctx.dn(item.nameAr, item.name)}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
          loading="lazy"
          unoptimized
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold" style={{ color: colors.text }}>
            {ctx.dn(item.nameAr, item.name)}
          </h3>
          {item.isSpecial && (
            <span className="text-xs" style={{ color: colors.special }}>
              <Star className="inline h-3 w-3" />
            </span>
          )}
        </div>
        {ctx.dd(item.descriptionAr, item.description) && (
          <p className="truncate text-xs" style={{ color: colors.textSecondary }}>
            {ctx.dd(item.descriptionAr, item.description)}
          </p>
        )}
        <ItemBadges item={item} colors={colors} dietaryLabels={ctx.dietaryLabels} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-bold" style={{ color: colors.price }}>
          {item.price} {item.currency}
        </span>
        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}>
          <Heart
            className={`h-4 w-4 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
            style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
          />
        </button>
      </div>
    </div>
  );
}

// ── OVERLAY (Midnight): full-width photo with text overlay at bottom ──
function renderItemOverlay(
  item: MenuItem,
  colors: Record<string, string>,
  showPhotos: boolean,
  toggleFavorite: (id: string) => void,
  favorites: string[],
  ctx: ItemRenderCtx
) {
  return (
    <div
      key={item.id}
      className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        height: showPhotos && item.photo ? "180px" : "auto",
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
      onClick={() => ctx.onItemClick(item)}
    >
      {showPhotos && item.photo ? (
        <>
          <Image
            src={item.photo}
            alt={ctx.dn(item.nameAr, item.name)}
            fill
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${colors.background}f0 0%, ${colors.background}90 40%, transparent 100%)`,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold" style={{ color: colors.text }}>
                    {ctx.dn(item.nameAr, item.name)}
                  </h3>
                  {item.isSpecial && <SpecialBadge colors={colors} label={ctx.t.special} />}
                </div>
                {ctx.dd(item.descriptionAr, item.description) && (
                  <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary }}>
                    {ctx.dd(item.descriptionAr, item.description)}
                  </p>
                )}
                <span className="mt-1 inline-block font-bold" style={{ color: colors.price }}>
                  {item.price} {item.currency}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                className="shrink-0"
              >
                <Heart
                  className={`h-5 w-5 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
                  style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
                />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold" style={{ color: colors.text }}>
                  {ctx.dn(item.nameAr, item.name)}
                </h3>
                {item.isSpecial && <SpecialBadge colors={colors} label={ctx.t.special} />}
              </div>
              {ctx.dd(item.descriptionAr, item.description) && (
                <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                  {ctx.dd(item.descriptionAr, item.description)}
                </p>
              )}
              <ItemBadges item={item} colors={colors} dietaryLabels={ctx.dietaryLabels} />
              <PriceRow item={item} colors={colors} dn={ctx.dn} />
              {item.availability === "UNAVAILABLE" && (
                <UnavailableBadge colors={colors} label={ctx.t.unavailable} />
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}>
              <Heart
                className={`h-5 w-5 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
                style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAGAZINE (Ocean): alternating large/small items ──
function renderItemMagazine(
  item: MenuItem,
  colors: Record<string, string>,
  showPhotos: boolean,
  toggleFavorite: (id: string) => void,
  favorites: string[],
  index: number,
  ctx: ItemRenderCtx
) {
  const isFeature = index % 3 === 0;

  if (isFeature) {
    return (
      <div
        key={item.id}
        className="overflow-hidden rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
        style={{
          backgroundColor: colors.surface,
          opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
        }}
        onClick={() => ctx.onItemClick(item)}
      >
        {showPhotos && item.photo && (
          <Image
            src={item.photo}
            alt={ctx.dn(item.nameAr, item.name)}
            width={400}
            height={192}
            className="h-48 w-full object-cover"
            loading="lazy"
            unoptimized
          />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                  {ctx.dn(item.nameAr, item.name)}
                </h3>
                {item.isSpecial && <SpecialBadge colors={colors} label={ctx.t.special} />}
              </div>
              {item.name && item.nameAr && (
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {ctx.lang === "ar" ? item.name : item.nameAr}
                </p>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}>
              <Heart
                className={`h-5 w-5 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
                style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
              />
            </button>
          </div>
          {ctx.dd(item.descriptionAr, item.description) && (
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              {ctx.dd(item.descriptionAr, item.description)}
            </p>
          )}
          <ItemBadges item={item} colors={colors} dietaryLabels={ctx.dietaryLabels} />
          <PriceRow item={item} colors={colors} dn={ctx.dn} />
          {item.availability === "UNAVAILABLE" && (
            <UnavailableBadge colors={colors} label={ctx.t.unavailable} />
          )}
        </div>
      </div>
    );
  }

  // Small item
  return (
    <div
      key={item.id}
      className="flex gap-3 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
      onClick={() => ctx.onItemClick(item)}
    >
      {showPhotos && item.photo && (
        <Image
          src={item.photo}
          alt={ctx.dn(item.nameAr, item.name)}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
          loading="lazy"
          unoptimized
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold" style={{ color: colors.text }}>
                {ctx.dn(item.nameAr, item.name)}
              </h3>
              {item.isSpecial && (
                <span className="text-xs" style={{ color: colors.special }}>
                  <Star className="inline h-3 w-3" />
                </span>
              )}
            </div>
            {ctx.dd(item.descriptionAr, item.description) && (
              <p className="truncate text-xs" style={{ color: colors.textSecondary }}>
                {ctx.dd(item.descriptionAr, item.description)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            className="shrink-0"
          >
            <Heart
              className={`h-4 w-4 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
            />
          </button>
        </div>
        <span className="mt-1 inline-block text-sm font-bold" style={{ color: colors.price }}>
          {item.price} {item.currency}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ITEM DETAIL MODAL
   ────────────────────────────────────────────────────────────── */
function ItemDetailModal({
  item,
  colors,
  showPhotos,
  lang,
  t,
  dietaryLabels,
  allergenNames,
  dn,
  dd,
  isOpen,
  favorites,
  toggleFavorite,
  onClose,
}: {
  item: MenuItem;
  colors: Record<string, string>;
  showPhotos: boolean;
  lang: string;
  t: Record<string, string>;
  dietaryLabels: Record<string, string>;
  allergenNames: Record<string, string>;
  dn: (nameAr: string | null, name: string) => string;
  dd: (descAr: string | null, desc: string | null) => string | null;
  isOpen: boolean;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundColor: isOpen ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        backdropFilter: isOpen ? "blur(4px)" : "none",
        transition: "all 200ms ease-out",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl"
        style={{
          backgroundColor: colors.surface,
          maxHeight: "90vh",
          overflowY: "auto",
          transform: isOpen ? "scale(1)" : "scale(0.95)",
          opacity: isOpen ? 1 : 0,
          transition: "all 200ms ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 end-3 z-10 rounded-full p-1.5"
          style={{ backgroundColor: colors.background + "cc" }}
        >
          <X className="h-5 w-5" style={{ color: colors.text }} />
        </button>

        {/* Photo */}
        {showPhotos && item.photo && (
          <Image
            src={item.photo}
            alt={dn(item.nameAr, item.name)}
            width={400}
            height={256}
            className="max-h-64 w-full object-cover"
            loading="lazy"
            unoptimized
          />
        )}

        <div className="space-y-4 p-5">
          {/* Primary name */}
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
              {dn(item.nameAr, item.name)}
            </h2>
            {item.name && item.nameAr && (
              <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary }}>
                {lang === "ar" ? item.name : item.nameAr}
              </p>
            )}
          </div>

          {/* Description */}
          {dd(item.descriptionAr, item.description) && (
            <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
              {dd(item.descriptionAr, item.description)}
            </p>
          )}

          {/* Price + variants */}
          <div>
            <span className="text-lg font-bold" style={{ color: colors.price }}>
              {item.price} {item.currency}
            </span>
            {item.variants.length > 0 && (
              <div className="mt-2 space-y-1">
                {item.variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    <span>{dn(v.nameAr, v.name)}</span>
                    <span>+{v.priceModifier} {item.currency}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergens */}
          {item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.allergens.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                  style={{ backgroundColor: colors.background, color: colors.textSecondary }}
                >
                  <span>{ALLERGEN_EMOJIS[a] || ""}</span>
                  <span>{allergenNames[a] || a}</span>
                </span>
              ))}
            </div>
          )}

          {/* Dietary tags */}
          {item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: colors.accent + "20", color: colors.accent }}
                >
                  {dietaryLabels[tag] || tag}
                </span>
              ))}
            </div>
          )}

          {/* Unavailable */}
          {item.availability === "UNAVAILABLE" && (
            <p className="text-sm font-medium" style={{ color: colors.unavailable }}>
              {t.unavailable}
            </p>
          )}

          {/* Favorite toggle */}
          <button
            onClick={() => toggleFavorite(item.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: favorites.includes(item.id) ? colors.primary + "15" : colors.background,
              color: favorites.includes(item.id) ? colors.primary : colors.textSecondary,
              border: `1px solid ${favorites.includes(item.id) ? colors.primary + "30" : colors.border}`,
            }}
          >
            <Heart
              className={`h-5 w-5 ${favorites.includes(item.id) ? "fill-current" : ""}`}
            />
            {favorites.includes(item.id) ? t.saved : t.addToFavorites}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────── */
export default function MenuDisplay({ restaurant, menu, theme, showBadge = true, slug, qrCodeId }: Props) {
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};
  const layout = theme.layout || {};
  const decoration = theme.decoration || {};
  const features = theme.features || {};

  const itemStyle = layout.itemStyle || "list";
  const categoryStyle = layout.categoryStyle || "simple";
  const decorationType = decoration.type || "none";
  const decorationColor = decoration.color;

  const showPhotos = String(features.showPhotos) === "true";
  const showDecorations = String(features.showDecorations) === "true";
  const useCustomFont = String(features.customFont) === "true";

  const fontFamily = useCustomFont && fonts.body
    ? `"${fonts.body}", "IBM Plex Sans Arabic", sans-serif`
    : undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    menu.categories[0]?.id || ""
  );
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Language state
  const [lang, setLang] = useState<"ar" | "en">("ar");

  // Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Derived values
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const dietaryLabels = getDietaryLabels(lang);
  const allergenNames = (ALLERGEN_NAMES[lang] || ALLERGEN_NAMES.ar);

  const displayName = useCallback(
    (nameAr: string | null, name: string) =>
      lang === "ar" ? (nameAr || name) : (name || nameAr || ""),
    [lang]
  );

  const displayDesc = useCallback(
    (descAr: string | null, desc: string | null): string | null =>
      lang === "ar" ? (descAr || desc) : (desc || descAr || null),
    [lang]
  );

  // Record QR scan on mount
  useEffect(() => {
    if (qrCodeId) {
      const key = `menur-scan-${qrCodeId}`;
      if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCodeId }),
        }).catch(() => {});
      }
    }
  }, [qrCodeId]);

  // Load Google Font dynamically for PRO themes
  useEffect(() => {
    if (useCustomFont && fonts.body && GOOGLE_FONT_URLS[fonts.body]) {
      const linkId = `gfont-${fonts.body.replace(/\s+/g, "-")}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = GOOGLE_FONT_URLS[fonts.body];
        document.head.appendChild(link);
      }
    }
  }, [useCustomFont, fonts.body]);

  // Load favorites from localStorage keyed by slug
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`menur-favorites-${slug}`);
      if (stored) setFavorites(JSON.parse(stored));
    }
  }, [slug]);

  // Load language preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`menur-lang-${slug}`);
      if (stored === "ar" || stored === "en") setLang(stored);
    }
  }, [slug]);

  // Save language preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`menur-lang-${slug}`, lang);
    }
  }, [lang, slug]);

  // Modal animation trigger
  useEffect(() => {
    if (selectedItem) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setModalOpen(true));
      });
    }
  }, [selectedItem]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  // Fetch feedback
  useEffect(() => {
    if (menu.id) {
      fetch(`/api/feedback?menuId=${menu.id}`)
        .then((r) => r.json())
        .then((data) => {
          setFeedbackList(data.feedback || []);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.total || 0);
        })
        .catch(() => {});
    }
  }, [menu.id]);

  const toggleFavorite = (itemId: string) => {
    const newFavs = favorites.includes(itemId)
      ? favorites.filter((f) => f !== itemId)
      : [...favorites, itemId];
    setFavorites(newFavs);
    if (typeof window !== "undefined") {
      localStorage.setItem(`menur-favorites-${slug}`, JSON.stringify(newFavs));
    }
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedItem(null), 200);
  }, []);

  const submitFeedback = async () => {
    if (!feedbackRating) return;
    setFeedbackSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: menu.id,
          rating: feedbackRating,
          comment: feedbackComment || null,
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        const data = await res.json();
        setFeedbackList((prev) => [data.feedback, ...prev]);
        setTotalReviews((prev) => prev + 1);
        setAverageRating((prev) =>
          Math.round(((prev * totalReviews + feedbackRating) / (totalReviews + 1)) * 10) / 10
        );
      }
    } catch {
      // Silently fail
    }
    setFeedbackSubmitting(false);
  };

  // Filter items
  const filterItems = (items: MenuItem[]) => {
    return items.filter((item) => {
      if (showFavoritesOnly && !favorites.includes(item.id)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchAr =
          item.nameAr?.includes(searchQuery) ||
          item.descriptionAr?.includes(searchQuery);
        const matchEn =
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q);
        if (!matchAr && !matchEn) return false;
      }
      if (activeDietaryFilter && !item.dietaryTags.includes(activeDietaryFilter)) {
        return false;
      }
      return true;
    });
  };

  // Get all unique dietary tags
  const allDietaryTags = [
    ...new Set(
      menu.categories.flatMap((cat) =>
        cat.items.flatMap((item) => item.dietaryTags)
      )
    ),
  ];

  // Render context for item renderers
  const ctx: ItemRenderCtx = {
    lang,
    dietaryLabels,
    t,
    dn: displayName,
    dd: displayDesc,
    onItemClick: (item) => setSelectedItem(item),
  };

  // Render item based on layout style
  const renderItem = (item: MenuItem, index: number = 0) => {
    switch (itemStyle) {
      case "cards":
        return renderItemCards(item, colors, showPhotos, toggleFavorite, favorites, ctx);
      case "grid":
        return renderItemGrid(item, colors, showPhotos, toggleFavorite, favorites, ctx);
      case "compact":
        return renderItemCompact(item, colors, showPhotos, toggleFavorite, favorites, ctx);
      case "overlay":
        return renderItemOverlay(item, colors, showPhotos, toggleFavorite, favorites, ctx);
      case "magazine":
        return renderItemMagazine(item, colors, showPhotos, toggleFavorite, favorites, index, ctx);
      default:
        return renderItemList(item, colors, showPhotos, toggleFavorite, favorites, ctx);
    }
  };

  // Grid wrapper for grid layout
  const wrapItems = (items: React.ReactNode[]) => {
    if (itemStyle === "grid") {
      return <div className="grid grid-cols-2 gap-4">{items}</div>;
    }
    return <div className="space-y-4">{items}</div>;
  };

  return (
    <div
      className="relative min-h-screen"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily,
      }}
    >
      {/* Global decorations */}
      {showDecorations && decorationType === "geometric" && (
        <GeometricPattern color={decorationColor || colors.primary} />
      )}
      {showDecorations && decorationType === "stars" && (
        <StarsDecoration color={decorationColor || colors.primary} />
      )}

      {/* Restaurant Header */}
      <header className="relative px-4 pt-8 pb-4 text-center">
        {showDecorations && decorationType === "floral" && (
          <FloralCorners color={decorationColor || colors.primary} />
        )}

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="absolute top-4 end-4 z-10 flex items-center overflow-hidden rounded-full text-xs font-semibold"
          style={{ border: `1px solid ${colors.border}` }}
        >
          <span
            className="px-2.5 py-1 transition-all duration-200"
            style={{
              backgroundColor: lang === "ar" ? colors.primary : "transparent",
              color: lang === "ar" ? "#fff" : colors.textSecondary,
            }}
          >
            AR
          </span>
          <span
            className="px-2.5 py-1 transition-all duration-200"
            style={{
              backgroundColor: lang === "en" ? colors.primary : "transparent",
              color: lang === "en" ? "#fff" : colors.textSecondary,
            }}
          >
            EN
          </span>
        </button>

        {restaurant.logo && (
          <Image
            src={restaurant.logo}
            alt=""
            width={80}
            height={80}
            className="mx-auto h-20 w-20 rounded-full object-cover"
            unoptimized
          />
        )}
        <h1 className="mt-3 text-2xl font-bold">
          {displayName(restaurant.nameAr, restaurant.name)}
        </h1>

        {/* Average rating */}
        {totalReviews > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold" style={{ color: colors.text }}>
              {averageRating}
            </span>
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              ({totalReviews})
            </span>
          </div>
        )}

        {/* Contact info */}
        <div
          className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm"
          style={{ color: colors.textSecondary }}
        >
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {restaurant.phone}
            </a>
          )}
          {restaurant.email && (
            <a href={`mailto:${restaurant.email}`} className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {restaurant.email}
            </a>
          )}
          {restaurant.website && (
            <a href={restaurant.website} target="_blank" className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {t.website}
            </a>
          )}
        </div>

        {restaurant.locations[0] && (
          <div
            className="mt-2 flex items-center justify-center gap-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            <MapPin className="h-3.5 w-3.5" />
            {displayName(restaurant.locations[0].addressAr, restaurant.locations[0].address)}
          </div>
        )}

        {/* Social links */}
        <div className="mt-3 flex items-center justify-center gap-3">
          {restaurant.instagram && (
            <a
              href={`https://instagram.com/${restaurant.instagram.replace("@", "")}`}
              target="_blank"
              className="text-sm hover:underline"
              style={{ color: colors.primary }}
            >
              Instagram
            </a>
          )}
          {restaurant.twitter && (
            <a
              href={`https://twitter.com/${restaurant.twitter.replace("@", "")}`}
              target="_blank"
              className="text-sm hover:underline"
              style={{ color: colors.primary }}
            >
              X
            </a>
          )}
          {restaurant.tiktok && (
            <a
              href={`https://tiktok.com/${restaurant.tiktok.replace("@", "")}`}
              target="_blank"
              className="text-sm hover:underline"
              style={{ color: colors.primary }}
            >
              TikTok
            </a>
          )}
        </div>
      </header>

      {/* Search + Filters */}
      <div className="sticky top-0 z-10 px-4 py-3" style={{ backgroundColor: colors.background }}>
        <div className="relative">
          <Search
            className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border py-2.5 ps-10 pe-4 text-sm transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary;
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Filter pills: dietary + favorites */}
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { setActiveDietaryFilter(null); setShowFavoritesOnly(false); }}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: !activeDietaryFilter && !showFavoritesOnly ? colors.primary : colors.surface,
              color: !activeDietaryFilter && !showFavoritesOnly ? "#fff" : colors.textSecondary,
              transform: !activeDietaryFilter && !showFavoritesOnly ? "scale(1.05)" : "scale(1)",
            }}
          >
            {t.all}
          </button>
          <button
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setActiveDietaryFilter(null); }}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: showFavoritesOnly ? colors.primary : colors.surface,
              color: showFavoritesOnly ? "#fff" : colors.textSecondary,
              transform: showFavoritesOnly ? "scale(1.05)" : "scale(1)",
            }}
          >
            <Heart className="h-3 w-3" />
            {t.favorites}
          </button>
          {allDietaryTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveDietaryFilter(activeDietaryFilter === tag ? null : tag);
                setShowFavoritesOnly(false);
              }}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: activeDietaryFilter === tag ? colors.primary : colors.surface,
                color: activeDietaryFilter === tag ? "#fff" : colors.textSecondary,
                transform: activeDietaryFilter === tag ? "scale(1.05)" : "scale(1)",
              }}
            >
              {dietaryLabels[tag] || tag}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites empty state */}
      {showFavoritesOnly && favorites.length === 0 && (
        <div className="px-4 py-12 text-center">
          <Heart className="mx-auto h-12 w-12" style={{ color: colors.textSecondary }} />
          <p className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
            {t.noFavorites}
          </p>
        </div>
      )}

      {/* Menu Content */}
      {!(showFavoritesOnly && favorites.length === 0) && (
        <>
          {menu.layout === "TABBED" ? (
            <div>
              <div
                className="flex gap-1 overflow-x-auto px-4 pb-2"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                {menu.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: activeCategory === cat.id ? colors.primary : "transparent",
                      color: activeCategory === cat.id ? "#fff" : colors.textSecondary,
                    }}
                  >
                    {displayName(cat.nameAr, cat.name)}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {menu.categories
                  .filter((cat) => cat.id === activeCategory)
                  .map((cat) => (
                    <div key={cat.id}>
                      {wrapItems(filterItems(cat.items).map((item, i) => renderItem(item, i)))}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 p-4">
              {menu.categories.map((cat, catIdx) => {
                const filteredItems = filterItems(cat.items);
                if (filteredItems.length === 0 && (searchQuery || showFavoritesOnly || activeDietaryFilter))
                  return null;

                return (
                  <div key={cat.id}>
                    {/* Category divider decoration */}
                    {showDecorations && catIdx > 0 && decorationType === "gold-dividers" && (
                      <GoldDivider color={decorationColor || colors.accent} />
                    )}
                    {showDecorations && catIdx > 0 && decorationType === "waves" && (
                      <WaveDivider color={decorationColor || colors.primary} />
                    )}

                    <CategoryHeader
                      cat={cat}
                      style={categoryStyle}
                      colors={colors}
                      decorationColor={showDecorations ? decorationColor : undefined}
                      dn={displayName}
                      dd={displayDesc}
                    />

                    {wrapItems(filteredItems.map((item, i) => renderItem(item, i)))}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Customer Feedback Section */}
      <div className="mt-8 border-t px-4 py-8" style={{ borderColor: colors.border }}>
        <h2 className="text-lg font-bold" style={{ color: colors.text }}>
          {t.rateExperience}
        </h2>

        {feedbackSubmitted ? (
          <div className="mt-4 rounded-xl p-6 text-center" style={{ backgroundColor: colors.surface }}>
            <Star className="mx-auto h-10 w-10 fill-amber-400 text-amber-400" />
            <p className="mt-2 font-semibold" style={{ color: colors.text }}>
              {t.thanksFeedback}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            {/* Star rating */}
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  onMouseEnter={() => setFeedbackHover(star)}
                  onMouseLeave={() => setFeedbackHover(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 transition ${
                      star <= (feedbackHover || feedbackRating)
                        ? "fill-amber-400 text-amber-400"
                        : ""
                    }`}
                    style={{
                      color: star <= (feedbackHover || feedbackRating) ? undefined : colors.border,
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder={t.leaveComment}
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border p-3 text-sm transition-all duration-200 focus:outline-none"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "none";
              }}
            />

            <button
              onClick={submitFeedback}
              disabled={!feedbackRating || feedbackSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {feedbackSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {feedbackSubmitting ? t.submitting : t.submitRating}
            </button>
          </div>
        )}

        {/* Recent feedback */}
        {feedbackList.length > 0 && (
          <div className="mt-6 space-y-3">
            {feedbackList.slice(0, 5).map((fb) => (
              <div
                key={fb.id}
                className="rounded-lg p-3"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < fb.rating ? "fill-amber-400 text-amber-400" : ""
                      }`}
                      style={{ color: i < fb.rating ? undefined : colors.border }}
                    />
                  ))}
                  <span className="ms-2 text-xs" style={{ color: colors.textSecondary }}>
                    {new Date(fb.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                  </span>
                </div>
                {fb.comment && (
                  <p className="mt-1 text-sm" style={{ color: colors.text }}>
                    {fb.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Powered by Menur */}
      {showBadge && (
        <footer className="py-6 text-center">
          <Link href="/" className="text-xs" style={{ color: colors.textSecondary }}>
            Powered by <span style={{ color: colors.primary }}>Menur</span>
          </Link>
        </footer>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          colors={colors}
          showPhotos={showPhotos}
          lang={lang}
          t={t}
          dietaryLabels={dietaryLabels}
          allergenNames={allergenNames}
          dn={displayName}
          dd={displayDesc}
          isOpen={modalOpen}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
