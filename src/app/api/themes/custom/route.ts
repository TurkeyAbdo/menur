import { NextResponse } from "next/server";
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
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ themes: [] });
    }

    const themes = await prisma.theme.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
      include: { _count: { select: { menus: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error("GET /api/themes/custom error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
