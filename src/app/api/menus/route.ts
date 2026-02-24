import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!restaurant) {
      return NextResponse.json({ menus: [] });
    }

    const menus = await prisma.menu.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        _count: { select: { categories: true } },
        theme: { select: { name: true, nameAr: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ menus });
  } catch (error) {
    console.error("GET /api/menus error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create restaurant
    let restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!restaurant) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      restaurant = await prisma.restaurant.create({
        data: {
          name: user?.name || "My Restaurant",
          slug: `restaurant-${session.user.id.slice(0, 8)}`,
          ownerId: session.user.id,
        },
      });
    }

    const body = await req.json();
    const { name, nameAr, description, descriptionAr, layout, status, themeId, categories } = body;

    const menu = await prisma.menu.create({
      data: {
        name: name || "",
        nameAr: nameAr || null,
        description: description || null,
        descriptionAr: descriptionAr || null,
        layout: layout || "SCROLLABLE",
        status: status || "DRAFT",
        themeId: themeId || null,
        restaurantId: restaurant.id,
        categories: {
          create: (categories || []).map(
            (cat: {
              name: string;
              nameAr: string;
              description: string;
              descriptionAr: string;
              sortOrder: number;
              items: {
                name: string;
                nameAr: string;
                description: string;
                descriptionAr: string;
                price: number;
                photo: string | null;
                allergens: string[];
                dietaryTags: string[];
                availability: string;
                isSpecial: boolean;
                timeSlot: string;
                sortOrder: number;
                variants: {
                  name: string;
                  nameAr: string;
                  priceModifier: number;
                }[];
              }[];
            }) => ({
              name: cat.name || "",
              nameAr: cat.nameAr || null,
              description: cat.description || null,
              descriptionAr: cat.descriptionAr || null,
              sortOrder: cat.sortOrder || 0,
              items: {
                create: (cat.items || []).map(
                  (item) => ({
                    name: item.name || "",
                    nameAr: item.nameAr || null,
                    description: item.description || null,
                    descriptionAr: item.descriptionAr || null,
                    price: item.price || 0,
                    photo: item.photo || null,
                    allergens: item.allergens || [],
                    dietaryTags: item.dietaryTags || [],
                    availability: item.availability || "AVAILABLE",
                    isSpecial: item.isSpecial || false,
                    timeSlot: item.timeSlot || "ALL",
                    sortOrder: item.sortOrder || 0,
                    variants: {
                      create: (item.variants || []).map(
                        (v) => ({
                          name: v.name || "",
                          nameAr: v.nameAr || null,
                          priceModifier: v.priceModifier || 0,
                        })
                      ),
                    },
                  })
                ),
              },
            })
          ),
        },
      },
      include: {
        categories: {
          include: {
            items: { include: { variants: true } },
          },
        },
      },
    });

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    console.error("POST /api/menus error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
