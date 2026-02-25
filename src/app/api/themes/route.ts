import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        isFree: true,
        previewImage: true,
        config: true,
      },
      orderBy: [{ isFree: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error("GET /api/themes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
