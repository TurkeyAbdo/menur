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
      include: { locations: true },
    });

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("GET /api/restaurant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const restaurant = await prisma.restaurant.upsert({
      where: { ownerId: session.user.id },
      update: {
        name: body.name,
        nameAr: body.nameAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        phone: body.phone,
        email: body.email,
        website: body.website,
        instagram: body.instagram,
        twitter: body.twitter,
        tiktok: body.tiktok,
        snapchat: body.snapchat,
      },
      create: {
        name: body.name || "My Restaurant",
        nameAr: body.nameAr,
        slug: `restaurant-${session.user.id.slice(0, 8)}`,
        description: body.description,
        descriptionAr: body.descriptionAr,
        phone: body.phone,
        email: body.email,
        website: body.website,
        instagram: body.instagram,
        twitter: body.twitter,
        tiktok: body.tiktok,
        snapchat: body.snapchat,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("PUT /api/restaurant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
