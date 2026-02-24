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

    // Verify ownership
    const location = await prisma.location.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!location || location.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, nameAr, address, addressAr, city, region, phone, openingHours, isActive } = body;

    const updated = await prisma.location.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameAr !== undefined && { nameAr: nameAr || null }),
        ...(address !== undefined && { address }),
        ...(addressAr !== undefined && { addressAr: addressAr || null }),
        ...(city !== undefined && { city }),
        ...(region !== undefined && { region: region || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(openingHours !== undefined && { openingHours }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ location: updated });
  } catch (error) {
    console.error("PUT /api/locations/[id] error:", error);
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

    const location = await prisma.location.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!location || location.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.location.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/locations/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
