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
  halal: "\u062D\u0644\u0627\u0644",
  vegan: "\u0646\u0628\u0627\u062A\u064A",
  vegetarian: "\u0646\u0628\u0627\u062A\u064A+",
  "gluten-free": "\u062E\u0627\u0644\u064A \u0645\u0646 \u0627\u0644\u062C\u0644\u0648\u062A\u064A\u0646",
  "sugar-free": "\u062E\u0627\u0644\u064A \u0645\u0646 \u0627\u0644\u0633\u0643\u0631",
  spicy: "\u{1F336}\uFE0F \u062D\u0627\u0631",
};

export default function MenuDisplay({ restaurant, menu, theme, showBadge = true, slug }: Props) {
  const colors = theme.colors || {};
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
          Math.round(((prev * (totalReviews) + feedbackRating) / (totalReviews + 1)) * 10) / 10
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

  const renderItem = (item: MenuItem) => (
    <div
      key={item.id}
      className="flex gap-4 rounded-xl p-4 transition"
      style={{
        backgroundColor: colors.surface,
        opacity: item.availability === "UNAVAILABLE" ? 0.6 : 1,
      }}
    >
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
              <h3 className="font-semibold" style={{ color: colors.text }}>
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
                  <Star className="inline h-3 w-3" /> \u0639\u0631\u0636 \u062E\u0627\u0635
                </span>
              )}
            </div>
            {item.name && item.nameAr && (
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {item.name}
              </p>
            )}
          </div>
          <button onClick={() => toggleFavorite(item.id)}>
            <Heart
              className={`h-5 w-5 transition ${
                favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""
              }`}
              style={{
                color: favorites.includes(item.id) ? undefined : colors.textSecondary,
              }}
            />
          </button>
        </div>

        {(item.descriptionAr || item.description) && (
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            {item.descriptionAr || item.description}
          </p>
        )}

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

        {item.availability === "UNAVAILABLE" && (
          <span
            className="mt-1 inline-block text-xs font-medium"
            style={{ color: colors.unavailable }}
          >
            \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0645\u0624\u0642\u062A\u0627\u064B
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
              \u0627\u0644\u0645\u0648\u0642\u0639
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
            placeholder="\u0627\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629..."
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
            \u0627\u0644\u0643\u0644
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
            \u0627\u0644\u0645\u0641\u0636\u0644\u0629
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
            \u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0641\u0636\u0644\u0627\u062A \u0628\u0639\u062F. \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0623\u064A\u0642\u0648\u0646\u0629 \u0627\u0644\u0642\u0644\u0628 \u0644\u062D\u0641\u0638 \u0627\u0644\u0639\u0646\u0627\u0635\u0631.
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
              <div className="space-y-3 p-4">
                {menu.categories
                  .filter((cat) => cat.id === activeCategory)
                  .map((cat) =>
                    filterItems(cat.items).map((item) => renderItem(item))
                  )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 p-4">
              {menu.categories.map((cat) => {
                const filteredItems = filterItems(cat.items);
                if (filteredItems.length === 0 && (searchQuery || showFavoritesOnly || activeDietaryFilter))
                  return null;

                return (
                  <div key={cat.id}>
                    <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                      {cat.nameAr || cat.name}
                    </h2>
                    {(cat.descriptionAr || cat.description) && (
                      <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
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
        </>
      )}

      {/* Customer Feedback Section */}
      <div className="mt-8 border-t px-4 py-8" style={{ borderColor: colors.border }}>
        <h2 className="text-lg font-bold" style={{ color: colors.text }}>
          \u0642\u064A\u0651\u0645 \u062A\u062C\u0631\u0628\u062A\u0643
        </h2>

        {feedbackSubmitted ? (
          <div className="mt-4 rounded-xl p-6 text-center" style={{ backgroundColor: colors.surface }}>
            <Star className="mx-auto h-10 w-10 fill-amber-400 text-amber-400" />
            <p className="mt-2 font-semibold" style={{ color: colors.text }}>
              \u0634\u0643\u0631\u0627\u064B \u0639\u0644\u0649 \u062A\u0642\u064A\u064A\u0645\u0643!
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
              placeholder="\u0627\u062A\u0631\u0643 \u062A\u0639\u0644\u064A\u0642\u0627\u064B (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)..."
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
              {feedbackSubmitting ? "\u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0631\u0633\u0627\u0644..." : "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u064A\u064A\u0645"}
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