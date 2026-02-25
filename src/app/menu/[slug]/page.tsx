import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import MenuDisplay from "./MenuDisplay";
import { getTierForUser } from "@/lib/tier-check";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ menu?: string }>;
}

export default async function PublicMenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { menu: menuId } = await searchParams;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      locations: { where: { isActive: true } },
      menus: {
        where: menuId
          ? { id: menuId, status: "PUBLISHED" }
          : { status: "PUBLISHED", isActive: true },
        take: 1,
        include: {
          theme: true,
          categories: {
            orderBy: { sortOrder: "asc" },
            include: {
              items: {
                orderBy: { sortOrder: "asc" },
                include: { variants: true },
              },
            },
          },
        },
      },
    },
  });

  if (!restaurant || restaurant.menus.length === 0) {
    notFound();
  }

  const menu = restaurant.menus[0];
  const tier = await getTierForUser(restaurant.ownerId);

  // Default theme colors
  const themeConfig = (menu.theme?.config as Record<string, Record<string, string>>) || {
    colors: {
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textSecondary: "#6b7280",
      primary: "#6366f1",
      accent: "#10b981",
      border: "#e5e7eb",
      price: "#059669",
      unavailable: "#ef4444",
      special: "#f59e0b",
    },
  };

  return (
    <MenuDisplay
      restaurant={{
        name: restaurant.name,
        nameAr: restaurant.nameAr,
        logo: restaurant.logo,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website,
        instagram: restaurant.instagram,
        twitter: restaurant.twitter,
        tiktok: restaurant.tiktok,
        snapchat: restaurant.snapchat,
        locations: restaurant.locations.map((l) => ({
          name: l.name,
          nameAr: l.nameAr,
          address: l.address,
          addressAr: l.addressAr,
          phone: l.phone,
          openingHours: l.openingHours as Record<string, { open: string; close: string }> | null,
        })),
      }}
      menu={{
        name: menu.name,
        nameAr: menu.nameAr,
        layout: menu.layout,
        categories: menu.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          nameAr: cat.nameAr,
          description: cat.description,
          descriptionAr: cat.descriptionAr,
          items: cat.items.map((item) => ({
            id: item.id,
            name: item.name,
            nameAr: item.nameAr,
            description: item.description,
            descriptionAr: item.descriptionAr,
            price: Number(item.price),
            currency: item.currency,
            photo: item.photo,
            allergens: item.allergens,
            dietaryTags: item.dietaryTags,
            availability: item.availability,
            isSpecial: item.isSpecial,
            timeSlot: item.timeSlot,
            variants: item.variants.map((v) => ({
              name: v.name,
              nameAr: v.nameAr,
              priceModifier: Number(v.priceModifier),
            })),
          })),
        })),
      }}
      theme={themeConfig}
      showBadge={tier === "FREE"}
    />
  );
}
