import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTierForUser } from "@/lib/tier-check";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let restaurantId: string | null = null;

    if (session?.user?.id) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
        select: { id: true },
      });
      restaurantId = restaurant?.id || null;
    }

    const themes = await prisma.theme.findMany({
      where: {
        isActive: true,
        OR: [
          { restaurantId: null },
          ...(restaurantId ? [{ restaurantId }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        isFree: true,
        previewImage: true,
        config: true,
        restaurantId: true,
      },
      orderBy: [{ restaurantId: "asc" }, { isFree: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error("GET /api/themes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tier = await getTierForUser(session.user.id);
    if (tier !== "ENTERPRISE") {
      return NextResponse.json(
        { error: "Custom themes are available for Enterprise plan only", tierLimit: true },
        { status: 403 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, nameAr, config } = body;

    if (!name || !config?.colors) {
      return NextResponse.json(
        { error: "Name and colors are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `custom-${baseSlug}-${Date.now().toString(36)}`;

    // Ensure config has all required fields with defaults
    const themeConfig = {
      colors: config.colors,
      fonts: config.fonts || { heading: "IBM Plex Sans Arabic", body: "IBM Plex Sans Arabic" },
      layout: config.layout || { itemStyle: "list", categoryStyle: "simple" },
      decoration: config.decoration || { type: "none", color: config.colors.primary },
      features: config.features || { showPhotos: false, showDecorations: false, customFont: false },
    };

    const theme = await prisma.theme.create({
      data: {
        name,
        nameAr: nameAr || null,
        slug,
        config: themeConfig,
        isFree: false,
        isActive: true,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error) {
    console.error("POST /api/themes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
