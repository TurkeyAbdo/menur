import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { error, status } = await requireAdmin();
    if (error) return NextResponse.json({ error }, { status: status! });

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [totalScans, todayScans, weekScans, monthScans, allScans] =
      await Promise.all([
        prisma.scan.count(),
        prisma.scan.count({
          where: { timestamp: { gte: todayStart } },
        }),
        prisma.scan.count({
          where: { timestamp: { gte: weekStart } },
        }),
        prisma.scan.count({
          where: { timestamp: { gte: monthStart } },
        }),
        prisma.scan.findMany({
          where: { timestamp: { gte: monthStart } },
          select: {
            timestamp: true,
            deviceType: true,
            qrCode: {
              select: {
                menu: {
                  select: {
                    restaurant: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

    // Device breakdown
    const deviceMap: Record<string, number> = {};
    allScans.forEach((scan) => {
      const type = scan.deviceType || "Unknown";
      deviceMap[type] = (deviceMap[type] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceMap).map(
      ([deviceType, count]) => ({ deviceType, count })
    );

    // Daily scans for last 30 days
    const dailyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
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

    // Top 10 restaurants by scans
    const restaurantMap: Record<string, { name: string; count: number }> = {};
    allScans.forEach((scan) => {
      const rest = scan.qrCode?.menu?.restaurant;
      if (rest) {
        if (!restaurantMap[rest.id]) {
          restaurantMap[rest.id] = { name: rest.name, count: 0 };
        }
        restaurantMap[rest.id].count++;
      }
    });
    const topRestaurants = Object.values(restaurantMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      totalScans,
      todayScans,
      weekScans,
      monthScans,
      deviceBreakdown,
      dailyScans,
      topRestaurants,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
