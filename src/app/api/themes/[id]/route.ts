import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Verify ownership
    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme || theme.restaurantId !== restaurant.id) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, nameAr, config } = body;

    if (!name || !config?.colors) {
      return NextResponse.json(
        { error: "Name and colors are required" },
        { status: 400 }
      );
    }

    const themeConfig = {
      colors: config.colors,
      fonts: config.fonts || { heading: "IBM Plex Sans Arabic", body: "IBM Plex Sans Arabic" },
      layout: config.layout || { itemStyle: "list", categoryStyle: "simple" },
      decoration: config.decoration || { type: "none", color: config.colors.primary },
      features: config.features || { showPhotos: false, showDecorations: false, customFont: false },
    };

    const updated = await prisma.theme.update({
      where: { id },
      data: {
        name,
        nameAr: nameAr || null,
        config: themeConfig,
      },
    });

    return NextResponse.json({ theme: updated });
  } catch (error) {
    console.error("PUT /api/themes/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const theme = await prisma.theme.findUnique({
      where: { id },
      include: { _count: { select: { menus: true } } },
    });

    if (!theme || theme.restaurantId !== restaurant.id) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (theme._count.menus > 0) {
      return NextResponse.json(
        { error: "Cannot delete a theme that is used by menus. Remove it from menus first." },
        { status: 400 }
      );
    }

    await prisma.theme.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/themes/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
