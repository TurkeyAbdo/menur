import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { qrCodeId } = await req.json();

    if (!qrCodeId) {
      return NextResponse.json({ error: "Missing qrCodeId" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "unknown";

    // Detect device type
    let deviceType = "desktop";
    if (/mobile/i.test(userAgent)) deviceType = "mobile";
    else if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";

    const scan = await prisma.scan.create({
      data: {
        qrCodeId,
        deviceType,
        userAgent,
      },
    });

    return NextResponse.json({ scan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/scan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
