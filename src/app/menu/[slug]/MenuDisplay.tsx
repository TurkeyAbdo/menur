"use client";

import { useState } from "react";
import {
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Star,
  Heart,
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

interface Props {
  restaurant: Restaurant;
  menu: {
    name: string;
    nameAr: string | null;
    layout: string;
    categories: Category[];
  };
  theme: Record<string, Record<string, string>>;
}

const ALLERGEN_EMOJIS: Record<string, string> = {
  gluten: "🌾",
  dairy: "🥛",
  nuts: "🥜",
  shellfish: "🦐",
  eggs: "🥚",
  fish: "🐟",
  soy: "🫘",
  sesame: "⚪",
};

const DIETARY_LABELS: Record<string, string> = {
  halal: "حلال",
  vegan: "نباتي",
  vegetarian: "نباتي+",
  "gluten-free": "خالي من الجلوتين",
  "sugar-free": "خالي من السكر",
  spicy: "🌶️ حار",
};

export default function MenuDisplay({ restaurant, menu, theme }: Props) {
  const colors = theme.colors || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    menu.categories[0]?.id || ""
  );
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string | null>(
    null
  );
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("menur-favorites") || "[]");
    }
    return [];
  });

  const toggleFavorite = (itemId: string) => {
    const newFavs = favorites.includes(itemId)
      ? favorites.filter((f) => f !== itemId)
      : [...favorites, itemId];
    setFavorites(newFavs);
    localStorage.setItem("menur-favorites", JSON.stringify(newFavs));
  };

  // Filter items
  const filterItems = (items: MenuItem[]) => {
    return items.filter((item) => {
      if (
        searchQuery &&
        !item.nameAr?.includes(searchQuery) &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.descriptionAr?.includes(searchQuery) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        activeDietaryFilter &&
        !item.dietaryTags.includes(activeDietaryFilter)
      ) {
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

  const renderItem = (item: MenuItem) => (
    <div
      key={item.id}
      className="flex gap-4 rounded-xl p-4 transition"
      style={{
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
      {/* Photo */}
      {item.photo && (
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
              <h3
                className="font-semibold"
                style={{ color: colors.text }}
              >
                {item.nameAr || item.name}
              </h3>
              {item.isSpecial && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: colors.special + "20",
                    color: colors.special,
                  }}
                >
                  <Star className="inline h-3 w-3" /> عرض خاص
                </span>
              )}
            </div>
            {item.name && item.nameAr && (
              <p
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                {item.name}
              </p>
            )}
          </div>
          <button onClick={() => toggleFavorite(item.id)}>
            <Heart
              className={`h-5 w-5 ${
                favorites.includes(item.id)
                  ? "fill-red-500 text-red-500"
                  : ""
              }`}
              style={{
                color: favorites.includes(item.id)
                  ? undefined
                  : colors.textSecondary,
              }}
            />
          </button>
        </div>

        {(item.descriptionAr || item.description) && (
          <p
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            {item.descriptionAr || item.description}
          </p>
        )}

        {/* Allergens */}
        {item.allergens.length > 0 && (
          <div className="mt-2 flex gap-1">
            {item.allergens.map((a) => (
              <span key={a} className="text-sm" title={a}>
                {ALLERGEN_EMOJIS[a] || a}
              </span>
            ))}
          </div>
        )}

        {/* Dietary tags */}
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

        {/* Price + Variants */}
        <div className="mt-2 flex items-center gap-3">
          <span className="font-bold" style={{ color: colors.price }}>
            {item.price} {item.currency}
          </span>
          {item.variants.map((v, i) => (
            <span
              key={i}
              className="text-xs"
              style={{ color: colors.textSecondary }}
            >
              {v.nameAr || v.name}: +{v.priceModifier} {item.currency}
            </span>
          ))}
        </div>

        {item.availability === "UNAVAILABLE" && (
          <span
            className="mt-1 inline-block text-xs font-medium"
            style={{ color: colors.unavailable }}
          >
            غير متاح مؤقتاً
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      {/* Restaurant Header */}
      <header className="px-4 pt-8 pb-4 text-center">
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
              الموقع
            </a>
          )}
        </div>

        {/* Location info */}
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

        {/* Dietary filter pills */}
        {allDietaryTags.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveDietaryFilter(null)}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
              style={{
                backgroundColor: !activeDietaryFilter
                  ? colors.primary
                  : colors.surface,
                color: !activeDietaryFilter ? "#fff" : colors.textSecondary,
              }}
            >
              الكل
            </button>
            {allDietaryTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setActiveDietaryFilter(
                    activeDietaryFilter === tag ? null : tag
                  )
                }
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
                style={{
                  backgroundColor:
                    activeDietaryFilter === tag
                      ? colors.primary
                      : colors.surface,
                  color:
                    activeDietaryFilter === tag ? "#fff" : colors.textSecondary,
                }}
              >
                {DIETARY_LABELS[tag] || tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Content */}
      {menu.layout === "TABBED" ? (
        /* TABBED LAYOUT */
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
                  backgroundColor:
                    activeCategory === cat.id ? colors.primary : "transparent",
                  color: activeCategory === cat.id ? "#fff" : colors.textSecondary,
                }}
              >
                {cat.nameAr || cat.name}
              </button>
            ))}
          </div>
          <div className="space-y-3 p-4">
            {menu.categories
              .filter((cat) => cat.id === activeCategory)
              .map((cat) =>
                filterItems(cat.items).map((item) => renderItem(item))
              )}
          </div>
        </div>
      ) : (
        /* SCROLLABLE LAYOUT */
        <div className="space-y-8 p-4">
          {menu.categories.map((cat) => {
            const filteredItems = filterItems(cat.items);
            if (filteredItems.length === 0 && searchQuery) return null;

            return (
              <div key={cat.id}>
                <h2
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  {cat.nameAr || cat.name}
                </h2>
                {(cat.descriptionAr || cat.description) && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {cat.descriptionAr || cat.description}
                  </p>
                )}
                <div className="mt-4 space-y-3">
                  {filteredItems.map((item) => renderItem(item))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Powered by Menur */}
      <footer className="py-6 text-center">
        <a
          href="/"
          className="text-xs"
          style={{ color: colors.textSecondary }}
        >
          Powered by <span style={{ color: colors.primary }}>Menur</span>
        </a>
      </footer>
    </div>
  );
}
