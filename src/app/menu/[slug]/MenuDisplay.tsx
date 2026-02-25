"use client";

import { useState, useEffect } from "react";
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
}

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

const DIETARY_LABELS: Record<string, string> = {
  halal: "حلال",
  vegan: "نباتي",
  vegetarian: "نباتي+",
  "gluten-free": "خالي من الجلوتين",
  "sugar-free": "خالي من السكر",
  spicy: "\u{1F336}\uFE0F حار",
};

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
}: {
  cat: Category;
  style: string;
  colors: Record<string, string>;
  decorationColor?: string;
}) {
  const name = cat.nameAr || cat.name;
  const desc = cat.descriptionAr || cat.description;

  switch (style) {
    case "elegant":
      return (
        <div className="mb-5 text-center">
          {decorationColor && (
            <div className="mx-auto mb-2 h-px w-12" style={{ backgroundColor: decorationColor }} />
          )}
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            {name}
          </h2>
          {desc && (
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
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
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full" style={{ backgroundColor: colors.primary }} />
            <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.text }}>
              {name}
            </h2>
          </div>
          {desc && (
            <p className="mt-1 text-sm ps-4" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
        </div>
      );

    case "accent":
      return (
        <div className="mb-4">
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
        <div className="mb-5 text-center">
          <h2
            className="text-lg font-bold"
            style={{ color: colors.primary, textShadow: `0 0 20px ${colors.primary}40` }}
          >
            {name}
          </h2>
          {desc && (
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
        </div>
      );

    case "wave":
      return (
        <div className="mb-4">
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>
            {name}
          </h2>
          {desc && (
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          )}
          {decorationColor && <WaveDivider color={decorationColor} />}
        </div>
      );

    default: // "simple"
      return (
        <div className="mb-4">
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            {name}
          </h2>
          {desc && (
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
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
}: {
  item: MenuItem;
  colors: Record<string, string>;
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
              {DIETARY_LABELS[tag] || tag}
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
}: {
  item: MenuItem;
  colors: Record<string, string>;
}) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="font-bold" style={{ color: colors.price }}>
        {item.price} {item.currency}
      </span>
      {item.variants.map((v, i) => (
        <span key={i} className="text-xs" style={{ color: colors.textSecondary }}>
          {v.nameAr || v.name}: +{v.priceModifier} {item.currency}
        </span>
      ))}
    </div>
  );
}

function SpecialBadge({
  colors,
}: {
  colors: Record<string, string>;
}) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: colors.special + "20",
        color: colors.special,
      }}
    >
      <Star className="inline h-3 w-3" /> {"عرض خاص"}
    </span>
  );
}

function UnavailableBadge({ colors }: { colors: Record<string, string> }) {
  return (
    <span
      className="mt-1 inline-block text-xs font-medium"
      style={{ color: colors.unavailable }}
    >
      {"غير متاح مؤقتاً"}
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
  favorites: string[]
) {
  return (
    <div
      key={item.id}
      className="flex items-start justify-between gap-3 border-b py-3"
      style={{
        borderColor: colors.border,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold" style={{ color: colors.text }}>
            {item.nameAr || item.name}
          </h3>
          {item.isSpecial && <SpecialBadge colors={colors} />}
          <button onClick={() => toggleFavorite(item.id)} className="ms-auto shrink-0">
            <Heart
              className={`h-4 w-4 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
            />
          </button>
        </div>
        {item.name && item.nameAr && (
          <p className="text-xs" style={{ color: colors.textSecondary }}>{item.name}</p>
        )}
        {(item.descriptionAr || item.description) && (
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            {item.descriptionAr || item.description}
          </p>
        )}
        <ItemBadges item={item} colors={colors} />
        <PriceRow item={item} colors={colors} />
        {item.availability === "UNAVAILABLE" && <UnavailableBadge colors={colors} />}
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
  favorites: string[]
) {
  return (
    <div
      key={item.id}
      className="flex gap-4 rounded-xl p-4 transition"
      style={{
        backgroundColor: colors.surface,
        boxShadow: `0 2px 12px ${colors.border}60`,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
      {showPhotos && item.photo && (
        <img
          src={item.photo}
          alt={item.nameAr || item.name}
          className="h-24 w-24 shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" style={{ color: colors.text }}>
                {item.nameAr || item.name}
              </h3>
              {item.isSpecial && <SpecialBadge colors={colors} />}
            </div>
            {item.name && item.nameAr && (
              <p className="text-xs" style={{ color: colors.textSecondary }}>{item.name}</p>
            )}
          </div>
          <button onClick={() => toggleFavorite(item.id)}>
            <Heart
              className={`h-5 w-5 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
            />
          </button>
        </div>
        {(item.descriptionAr || item.description) && (
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            {item.descriptionAr || item.description}
          </p>
        )}
        <ItemBadges item={item} colors={colors} />
        <PriceRow item={item} colors={colors} />
        {item.availability === "UNAVAILABLE" && <UnavailableBadge colors={colors} />}
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
  favorites: string[]
) {
  return (
    <div
      key={item.id}
      className="overflow-hidden rounded-lg transition"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
      {showPhotos && item.photo && (
        <img
          src={item.photo}
          alt={item.nameAr || item.name}
          className="h-32 w-full object-cover"
        />
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
            {item.nameAr || item.name}
          </h3>
          <button onClick={() => toggleFavorite(item.id)} className="shrink-0">
            <Heart
              className={`h-4 w-4 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
            />
          </button>
        </div>
        {item.isSpecial && (
          <div className="mt-1">
            <SpecialBadge colors={colors} />
          </div>
        )}
        {(item.descriptionAr || item.description) && (
          <p className="mt-1 text-xs line-clamp-2" style={{ color: colors.textSecondary }}>
            {item.descriptionAr || item.description}
          </p>
        )}
        <ItemBadges item={item} colors={colors} />
        <div className="mt-2">
          <span className="text-sm font-bold" style={{ color: colors.price }}>
            {item.price} {item.currency}
          </span>
        </div>
        {item.availability === "UNAVAILABLE" && <UnavailableBadge colors={colors} />}
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
  favorites: string[]
) {
  return (
    <div
      key={item.id}
      className="flex items-center gap-3 rounded-lg border-s-[3px] py-2.5 ps-3 pe-2"
      style={{
        borderColor: item.isSpecial ? colors.special : colors.primary,
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
      {showPhotos && item.photo && (
        <img
          src={item.photo}
          alt={item.nameAr || item.name}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold" style={{ color: colors.text }}>
            {item.nameAr || item.name}
          </h3>
          {item.isSpecial && (
            <span className="text-xs" style={{ color: colors.special }}>
              <Star className="inline h-3 w-3" />
            </span>
          )}
        </div>
        {(item.descriptionAr || item.description) && (
          <p className="truncate text-xs" style={{ color: colors.textSecondary }}>
            {item.descriptionAr || item.description}
          </p>
        )}
        <ItemBadges item={item} colors={colors} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-bold" style={{ color: colors.price }}>
          {item.price} {item.currency}
        </span>
        <button onClick={() => toggleFavorite(item.id)}>
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
  favorites: string[]
) {
  return (
    <div
      key={item.id}
      className="relative overflow-hidden rounded-xl"
      style={{
        height: showPhotos && item.photo ? "180px" : "auto",
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
      {showPhotos && item.photo ? (
        <>
          <img
            src={item.photo}
            alt={item.nameAr || item.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${colors.background}ee 0%, ${colors.background}80 40%, transparent 100%)`,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold" style={{ color: colors.text }}>
                    {item.nameAr || item.name}
                  </h3>
                  {item.isSpecial && <SpecialBadge colors={colors} />}
                </div>
                {(item.descriptionAr || item.description) && (
                  <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary }}>
                    {item.descriptionAr || item.description}
                  </p>
                )}
                <span className="mt-1 inline-block font-bold" style={{ color: colors.price }}>
                  {item.price} {item.currency}
                </span>
              </div>
              <button onClick={() => toggleFavorite(item.id)} className="shrink-0">
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
                  {item.nameAr || item.name}
                </h3>
                {item.isSpecial && <SpecialBadge colors={colors} />}
              </div>
              {(item.descriptionAr || item.description) && (
                <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                  {item.descriptionAr || item.description}
                </p>
              )}
              <ItemBadges item={item} colors={colors} />
              <PriceRow item={item} colors={colors} />
              {item.availability === "UNAVAILABLE" && <UnavailableBadge colors={colors} />}
            </div>
            <button onClick={() => toggleFavorite(item.id)}>
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
  index: number
) {
  const isFeature = index % 3 === 0;

  if (isFeature) {
    return (
      <div
        key={item.id}
        className="overflow-hidden rounded-xl"
        style={{
          backgroundColor: colors.surface,
          opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
        }}
      >
        {showPhotos && item.photo && (
          <img
            src={item.photo}
            alt={item.nameAr || item.name}
            className="h-44 w-full object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                  {item.nameAr || item.name}
                </h3>
                {item.isSpecial && <SpecialBadge colors={colors} />}
              </div>
              {item.name && item.nameAr && (
                <p className="text-xs" style={{ color: colors.textSecondary }}>{item.name}</p>
              )}
            </div>
            <button onClick={() => toggleFavorite(item.id)}>
              <Heart
                className={`h-5 w-5 transition ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`}
                style={{ color: favorites.includes(item.id) ? undefined : colors.textSecondary }}
              />
            </button>
          </div>
          {(item.descriptionAr || item.description) && (
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              {item.descriptionAr || item.description}
            </p>
          )}
          <ItemBadges item={item} colors={colors} />
          <PriceRow item={item} colors={colors} />
          {item.availability === "UNAVAILABLE" && <UnavailableBadge colors={colors} />}
        </div>
      </div>
    );
  }

  // Small item
  return (
    <div
      key={item.id}
      className="flex gap-3 rounded-lg p-3"
      style={{
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
      {showPhotos && item.photo && (
        <img
          src={item.photo}
          alt={item.nameAr || item.name}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold" style={{ color: colors.text }}>
                {item.nameAr || item.name}
              </h3>
              {item.isSpecial && (
                <span className="text-xs" style={{ color: colors.special }}>
                  <Star className="inline h-3 w-3" />
                </span>
              )}
            </div>
            {(item.descriptionAr || item.description) && (
              <p className="truncate text-xs" style={{ color: colors.textSecondary }}>
                {item.descriptionAr || item.description}
              </p>
            )}
          </div>
          <button onClick={() => toggleFavorite(item.id)} className="shrink-0">
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
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────── */
export default function MenuDisplay({ restaurant, menu, theme, showBadge = true, slug }: Props) {
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

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

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
      if (
        searchQuery &&
        !item.nameAr?.includes(searchQuery) &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.descriptionAr?.includes(searchQuery) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
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

  // Render item based on layout style
  const renderItem = (item: MenuItem, index: number = 0) => {
    const args = [item, colors, showPhotos, toggleFavorite, favorites] as const;
    switch (itemStyle) {
      case "cards":
        return renderItemCards(...args);
      case "grid":
        return renderItemGrid(...args);
      case "compact":
        return renderItemCompact(...args);
      case "overlay":
        return renderItemOverlay(...args);
      case "magazine":
        return renderItemMagazine(...args, index);
      default:
        return renderItemList(...args);
    }
  };

  // Grid wrapper for grid layout
  const wrapItems = (items: React.ReactNode[]) => {
    if (itemStyle === "grid") {
      return <div className="grid grid-cols-2 gap-3">{items}</div>;
    }
    return <div className="space-y-3">{items}</div>;
  };

  return (
    <div
      className="relative min-h-screen"
      dir="rtl"
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
        {restaurant.logo && (
          <img
            src={restaurant.logo}
            alt=""
            className="mx-auto h-20 w-20 rounded-full object-cover"
          />
        )}
        <h1 className="mt-3 text-2xl font-bold">
          {restaurant.nameAr || restaurant.name}
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
              {"الموقع"}
            </a>
          )}
        </div>

        {restaurant.locations[0] && (
          <div
            className="mt-2 flex items-center justify-center gap-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            <MapPin className="h-3.5 w-3.5" />
            {restaurant.locations[0].addressAr || restaurant.locations[0].address}
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
            placeholder="ابحث في القائمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border py-2.5 ps-10 pe-4 text-sm focus:outline-none"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        </div>

        {/* Filter pills: dietary + favorites */}
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { setActiveDietaryFilter(null); setShowFavoritesOnly(false); }}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
            style={{
              backgroundColor: !activeDietaryFilter && !showFavoritesOnly ? colors.primary : colors.surface,
              color: !activeDietaryFilter && !showFavoritesOnly ? "#fff" : colors.textSecondary,
            }}
          >
            {"الكل"}
          </button>
          <button
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setActiveDietaryFilter(null); }}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition"
            style={{
              backgroundColor: showFavoritesOnly ? colors.primary : colors.surface,
              color: showFavoritesOnly ? "#fff" : colors.textSecondary,
            }}
          >
            <Heart className="h-3 w-3" />
            {"المفضلة"}
          </button>
          {allDietaryTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveDietaryFilter(activeDietaryFilter === tag ? null : tag);
                setShowFavoritesOnly(false);
              }}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
              style={{
                backgroundColor: activeDietaryFilter === tag ? colors.primary : colors.surface,
                color: activeDietaryFilter === tag ? "#fff" : colors.textSecondary,
              }}
            >
              {DIETARY_LABELS[tag] || tag}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites empty state */}
      {showFavoritesOnly && favorites.length === 0 && (
        <div className="px-4 py-12 text-center">
          <Heart className="mx-auto h-12 w-12" style={{ color: colors.textSecondary }} />
          <p className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
            {"لا توجد مفضلات بعد. اضغط على أيقونة القلب لحفظ العناصر."}
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
                    className="shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition"
                    style={{
                      backgroundColor: activeCategory === cat.id ? colors.primary : "transparent",
                      color: activeCategory === cat.id ? "#fff" : colors.textSecondary,
                    }}
                  >
                    {cat.nameAr || cat.name}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {menu.categories
                  .filter((cat) => cat.id === activeCategory)
                  .map((cat) =>
                    wrapItems(filterItems(cat.items).map((item, i) => renderItem(item, i)))
                  )}
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
          {"قيّم تجربتك"}
        </h2>

        {feedbackSubmitted ? (
          <div className="mt-4 rounded-xl p-6 text-center" style={{ backgroundColor: colors.surface }}>
            <Star className="mx-auto h-10 w-10 fill-amber-400 text-amber-400" />
            <p className="mt-2 font-semibold" style={{ color: colors.text }}>
              {"شكراً على تقييمك!"}
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
              placeholder="اترك تعليقاً (اختياري)..."
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border p-3 text-sm focus:outline-none"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
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
              {feedbackSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
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
                    {new Date(fb.createdAt).toLocaleDateString("ar-SA")}
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
          <a href="/" className="text-xs" style={{ color: colors.textSecondary }}>
            Powered by <span style={{ color: colors.primary }}>Menur</span>
          </a>
        </footer>
      )}
    </div>
  );
}
