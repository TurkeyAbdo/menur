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
      return NextResponse.json({ locations: [] });
    }

    const locations = await prisma.location.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("GET /api/locations error:", error);
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

    // Check tier limits
    const tierCheck = await checkTierLimit(session.user.id, "locations");
    if (!tierCheck.allowed) {
      return NextResponse.json(
        { error: tierCheck.message, tierLimit: true },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, nameAr, address, addressAr, city, region, phone, openingHours } = body;

    if (!name || !address || !city) {
      return NextResponse.json(
        { error: "Name, address, and city are required" },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name,
        nameAr: nameAr || null,
        address,
        addressAr: addressAr || null,
        city,
        region: region || null,
        phone: phone || null,
        openingHours: openingHours || null,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    console.error("POST /api/locations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
