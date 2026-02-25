import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkTierLimit } from "@/lib/tier-check";

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
      return NextResponse.json({ qrCodes: [] });
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: { menu: { restaurantId: restaurant.id } },
      include: {
        menu: { select: { name: true, nameAr: true } },
        _count: { select: { scans: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ qrCodes });
  } catch (error) {
    console.error("GET /api/qr error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check tier limits
    const tierCheck = await checkTierLimit(session.user.id, "qrCodes");
    if (!tierCheck.allowed) {
      return NextResponse.json(
        { error: tierCheck.message, tierLimit: true },
        { status: 403 }
      );
    }

    const { menuId, label, config } = await req.json();

    // Verify menu belongs to user
    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        restaurant: { ownerId: session.user.id },
      },
      include: { restaurant: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const menuUrl = `${process.env.NEXTAUTH_URL}/menu/${menu.restaurant.slug}?menu=${menu.id}`;

    const qrCode = await prisma.qRCode.create({
      data: {
        label,
        config: config || {},
        menuUrl,
        menuId,
      },
      include: {
        menu: { select: { name: true, nameAr: true } },
        _count: { select: { scans: true } },
      },
    });

    return NextResponse.json({ qrCode }, { status: 201 });
  } catch (error) {
    console.error("POST /api/qr error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
