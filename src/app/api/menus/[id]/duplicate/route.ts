import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkTierLimit } from "@/lib/tier-check";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the menu with all nested data
    const original = await prisma.menu.findUnique({
      where: { id },
      include: {
        restaurant: { select: { ownerId: true } },
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

    if (!original || original.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check tier limits
    const tierCheck = await checkTierLimit(session.user.id, "menus");
    if (!tierCheck.allowed) {
      return NextResponse.json(
        { error: tierCheck.message, tierLimit: true },
        { status: 403 }
      );
    }

    // Create duplicate
    const duplicate = await prisma.menu.create({
      data: {
        name: `${original.name} (Copy)`,
        nameAr: original.nameAr ? `${original.nameAr} (نسخة)` : null,
        description: original.description,
        descriptionAr: original.descriptionAr,
        layout: original.layout,
        status: "DRAFT",
        themeId: original.themeId,
        restaurantId: original.restaurantId,
        categories: {
          create: original.categories.map((cat) => ({
            name: cat.name,
            nameAr: cat.nameAr,
            description: cat.description,
            descriptionAr: cat.descriptionAr,
            sortOrder: cat.sortOrder,
            items: {
              create: cat.items.map((item) => ({
                name: item.name,
                nameAr: item.nameAr,
                description: item.description,
                descriptionAr: item.descriptionAr,
                price: item.price,
                currency: item.currency,
                photo: item.photo,
                allergens: item.allergens,
                dietaryTags: item.dietaryTags,
                availability: item.availability,
                isSpecial: item.isSpecial,
                timeSlot: item.timeSlot,
                sortOrder: item.sortOrder,
                variants: {
                  create: item.variants.map((v) => ({
                    name: v.name,
                    nameAr: v.nameAr,
                    priceModifier: v.priceModifier,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        _count: { select: { categories: true } },
        theme: { select: { name: true, nameAr: true } },
      },
    });

    return NextResponse.json({ menu: duplicate }, { status: 201 });
  } catch (error) {
    console.error("POST /api/menus/[id]/duplicate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}