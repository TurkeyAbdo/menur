import { prisma } from "@/lib/db";
import { TIER_LIMITS, TierKey } from "@/lib/tiers";

interface TierCheckResult {
  allowed: boolean;
  tier: TierKey;
  limit: number | typeof Infinity;
  current: number;
  message?: string;
}

export async function checkTierLimit(
  userId: string,
  resource: "menus" | "menuItems" | "qrCodes" | "locations"
): Promise<TierCheckResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const tier: TierKey = (subscription?.tier as TierKey) || "FREE";
  const limits = TIER_LIMITS[tier];
  const limit = limits[resource];

  let current = 0;

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: userId },
  });

  if (!restaurant) {
    return { allowed: true, tier, limit, current: 0 };
  }

  switch (resource) {
    case "menus":
      current = await prisma.menu.count({
        where: { restaurantId: restaurant.id },
      });
      break;
    case "menuItems": {
      const menus = await prisma.menu.findMany({
        where: { restaurantId: restaurant.id },
        select: { id: true },
      });
      current = await prisma.menuItem.count({
        where: {
          category: { menuId: { in: menus.map((m) => m.id) } },
        },
      });
      break;
    }
    case "qrCodes":
      current = await prisma.qRCode.count({
        where: { menu: { restaurantId: restaurant.id } },
      });
      break;
    case "locations":
      current = await prisma.location.count({
        where: { restaurantId: restaurant.id },
      });
      break;
  }

  const allowed = current < limit;

  return {
    allowed,
    tier,
    limit,
    current,
    message: allowed
      ? undefined
      : `You've reached the ${resource} limit for the ${tier} plan (${limit}). Upgrade to add more.`,
  };
}

export async function getTierForUser(userId: string): Promise<TierKey> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  return (subscription?.tier as TierKey) || "FREE";
}
