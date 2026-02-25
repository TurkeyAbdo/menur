export const TIER_LIMITS = {
  FREE: {
    menus: 1,
    menuItems: 30,
    qrCodes: 1,
    locations: 1,
    themes: "free", // only free themes
    analytics: false,
    languages: 1,
    itemPhotos: false,
    customDomain: false,
  },
  BASIC: {
    menus: 3,
    menuItems: 100,
    qrCodes: 3,
    locations: 1,
    themes: "all",
    analytics: true, // basic
    languages: 2,
    itemPhotos: true,
    customDomain: false,
  },
  PRO: {
    menus: Infinity,
    menuItems: Infinity,
    qrCodes: Infinity,
    locations: 5,
    themes: "all",
    analytics: true, // full
    languages: Infinity,
    itemPhotos: true,
    customDomain: true,
  },
  ENTERPRISE: {
    menus: Infinity,
    menuItems: Infinity,
    qrCodes: Infinity,
    locations: Infinity,
    themes: "custom",
    analytics: true, // full
    languages: Infinity,
    itemPhotos: true,
    customDomain: true,
  },
} as const;

export type TierKey = keyof typeof TIER_LIMITS;

// Prices in SAR (including 15% VAT)
export const TIER_PRICING = {
  FREE: { price: 0, vat: 0, label: "Free", labelAr: "مجاني" },
  BASIC: { price: 29.57, vat: 4.43, label: "Basic", labelAr: "أساسي" }, // 34 SAR total
  PRO: { price: 94.78, vat: 14.22, label: "Pro", labelAr: "احترافي" }, // 109 SAR total
  ENTERPRISE: { price: 257.39, vat: 38.61, label: "Enterprise", labelAr: "مؤسسات" }, // 296 SAR total
} as const;

export function getTotalPrice(tier: TierKey): number {
  const p = TIER_PRICING[tier];
  return p.price + p.vat;
}
