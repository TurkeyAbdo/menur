import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return NextResponse.json({ error }, { status: status! });

    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = tier ? { tier: tier as any } : {};

    const [subscriptions, total, tierCounts] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          tier: true,
          status: true,
          priceAmount: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              name: true,
              restaurant: { select: { name: true } },
            },
          },
        },
      }),
      prisma.subscription.count({ where }),
      prisma.subscription.groupBy({
        by: ["tier"],
        _count: { tier: true },
      }),
    ]);

    const tiers = { FREE: 0, BASIC: 0, PRO: 0, ENTERPRISE: 0 };
    tierCounts.forEach((tc) => {
      tiers[tc.tier] = tc._count.tier;
    });

    return NextResponse.json({
      subscriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      tierCounts: tiers,
    });
  } catch (error) {
    console.error("GET /api/admin/subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
