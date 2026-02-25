import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { error, status } = await requireAdmin();
    if (error) return NextResponse.json({ error }, { status: status! });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalRestaurants,
      totalUsers,
      activeSubscriptions,
      revenueResult,
      totalScans,
      recentSignups,
      tierBreakdown,
      recentUsers,
    ] = await Promise.all([
      prisma.restaurant.count(),
      prisma.user.count(),
      prisma.subscription.count({
        where: { status: "ACTIVE", tier: { not: "FREE" } },
      }),
      prisma.subscription.aggregate({
        _sum: { priceAmount: true },
        where: { status: "ACTIVE" },
      }),
      prisma.scan.count(),
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.subscription.groupBy({
        by: ["tier"],
        _count: { tier: true },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          provider: true,
          createdAt: true,
        },
      }),
    ]);

    const tiers = {
      FREE: 0,
      BASIC: 0,
      PRO: 0,
      ENTERPRISE: 0,
    };
    tierBreakdown.forEach((t) => {
      tiers[t.tier] = t._count.tier;
    });

    return NextResponse.json({
      totalRestaurants,
      totalUsers,
      activeSubscriptions,
      totalRevenue: Number(revenueResult._sum.priceAmount || 0),
      totalScans,
      recentSignups,
      tierBreakdown: tiers,
      recentUsers,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
