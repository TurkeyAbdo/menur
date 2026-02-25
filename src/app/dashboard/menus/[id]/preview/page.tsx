import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import MenuDisplay from "@/app/menu/[slug]/MenuDisplay";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MenuPreviewPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const menu = await prisma.menu.findUnique({
    where: { id },
    include: {
      restaurant: {
        include: {
          locations: { where: { isActive: true } },
        },
      },
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
  });

  if (!menu || menu.restaurant.ownerId !== session.user.id) {
    notFound();
  }

  const restaurant = menu.restaurant;

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
    fonts: {
      heading: "IBM Plex Sans Arabic",
      body: "IBM Plex Sans Arabic",
    },
    layout: {
      itemStyle: "list",
      categoryStyle: "simple",
    },
    decoration: {
      type: "none",
    },
    features: {
      showPhotos: "false",
      showDecorations: "false",
      customFont: "false",
    },
  };

  return (
    <div className="-m-4 lg:-m-8">
      {/* Preview banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2">
        <span className="text-sm font-medium text-amber-800">
          Preview Mode — This is how your menu looks to customers
        </span>
        <a
          href={`/menu/${restaurant.slug}?menu=${menu.id}`}
          target="_blank"
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
        >
          Open Public Link
        </a>
      </div>

      <MenuDisplay
        slug={restaurant.slug}
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
          id: menu.id,
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
      />
    </div>
  );
}
