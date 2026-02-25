import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { menuId, rating, comment } = await req.json();

    if (!menuId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Menu ID and rating (1-5) are required" },
        { status: 400 }
      );
    }

    // Verify menu exists and get the restaurant owner
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const feedback = await prisma.customerFeedback.create({
      data: {
        rating,
        comment: comment || null,
        menuId,
        userId: menu.restaurant.ownerId,
      },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get("menuId");

    if (!menuId) {
      return NextResponse.json(
        { error: "menuId is required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.customerFeedback.findMany({
      where: { menuId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const total = feedback.length;
    const averageRating =
      total > 0
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / total
        : 0;

    return NextResponse.json({
      feedback,
      averageRating: Math.round(averageRating * 10) / 10,
      total,
    });
  } catch (error) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}