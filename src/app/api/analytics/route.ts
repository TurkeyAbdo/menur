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
    });

    if (!restaurant) {
      return NextResponse.json({
        totalScans: 0,
        todayScans: 0,
        weekScans: 0,
        monthScans: 0,
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
        dailyScans: [],
      });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);
    const fourteenDaysAgo = new Date(todayStart);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const whereClause = {
      qrCode: { menu: { restaurantId: restaurant.id } },
    };

    const [totalScans, todayScans, weekScans, monthScans, allScans] =
      await Promise.all([
        prisma.scan.count({ where: whereClause }),
        prisma.scan.count({
          where: { ...whereClause, timestamp: { gte: todayStart } },
        }),
        prisma.scan.count({
          where: { ...whereClause, timestamp: { gte: weekStart } },
        }),
        prisma.scan.count({
          where: { ...whereClause, timestamp: { gte: monthStart } },
        }),
        prisma.scan.findMany({
          where: { ...whereClause, timestamp: { gte: fourteenDaysAgo } },
          select: { timestamp: true, deviceType: true },
        }),
      ]);

    // Device breakdown
    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
    allScans.forEach((scan) => {
      const type = scan.deviceType as keyof typeof deviceBreakdown;
      if (type in deviceBreakdown) deviceBreakdown[type]++;
    });

    // Daily scans for last 14 days
    const dailyMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      dailyMap[d.toISOString().split("T")[0]] = 0;
    }
    allScans.forEach((scan) => {
      const dateKey = scan.timestamp.toISOString().split("T")[0];
      if (dateKey in dailyMap) dailyMap[dateKey]++;
    });

    const dailyScans = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      totalScans,
      todayScans,
      weekScans,
      monthScans,
      deviceBreakdown,
      dailyScans,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
