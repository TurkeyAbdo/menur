import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    // Verify ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        menu: { restaurant: { ownerId: session.user.id } },
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.qRCode.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/qr error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
