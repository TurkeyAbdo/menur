import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const menu = await prisma.menu.findUnique({
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

    if (!menu || menu.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("GET /api/menus/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.menu.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!existing || existing.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, nameAr, description, descriptionAr, layout, status, themeId, categories } = body;

    // Delete old categories (cascade deletes items and variants)
    await prisma.category.deleteMany({ where: { menuId: id } });

    // Update menu and recreate categories
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name: name || "",
        nameAr: nameAr || null,
        description: description || null,
        descriptionAr: descriptionAr || null,
        layout: layout || "SCROLLABLE",
        status: status || "DRAFT",
        themeId: themeId || null,
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
                create: (cat.items || []).map((item) => ({
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
                    create: (item.variants || []).map((v) => ({
                      name: v.name || "",
                      nameAr: v.nameAr || null,
                      priceModifier: v.priceModifier || 0,
                    })),
                  },
                })),
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

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("PUT /api/menus/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.menu.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!existing || existing.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.menu.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/menus/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
