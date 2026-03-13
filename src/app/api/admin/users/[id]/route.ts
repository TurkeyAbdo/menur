import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, errorAr, status, session } = await requireAdmin();
    if (error) return NextResponse.json({ error, errorAr }, { status: status! });

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role", errorAr: "دور غير صالح" },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own role
    if (id === session!.user.id) {
      return NextResponse.json(
        { error: "Cannot change your own role", errorAr: "لا يمكنك تغيير دورك الخاص" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    logger.error("PATCH /api/admin/users/[id] error", { error: String(error) });
    return NextResponse.json(
      { error: "Internal server error", errorAr: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
