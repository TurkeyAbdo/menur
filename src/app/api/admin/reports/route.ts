import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return NextResponse.json({ error }, { status: status! });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const format = searchParams.get("format") || "csv";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }

    let csv = "";
    let filename = "";
    let headers: string[] = [];
    let rows: string[][] = [];
    let summary: Record<string, unknown> = {};

    if (type === "scans") {
      const scans = await prisma.scan.findMany({
        where:
          Object.keys(dateFilter).length > 0
            ? { timestamp: dateFilter }
            : {},
        include: {
          qrCode: {
            include: {
              menu: {
                include: { restaurant: true },
              },
            },
          },
        },
        orderBy: { timestamp: "desc" },
      });

      headers = [
        "Date",
        "Time",
        "Device Type",
        "City",
        "Country",
        "Restaurant",
        "Menu",
        "QR Code Label",
      ];
      rows = scans.map((scan) => [
        scan.timestamp.toISOString().split("T")[0],
        scan.timestamp.toISOString().split("T")[1].slice(0, 8),
        scan.deviceType || "",
        scan.city || "",
        scan.country || "",
        scan.qrCode?.menu?.restaurant?.name || "",
        scan.qrCode?.menu?.name || "",
        scan.qrCode?.label || "",
      ]);

      if (format === "json") {
        const deviceCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};
        for (const scan of scans) {
          const d = scan.deviceType || "Unknown";
          deviceCounts[d] = (deviceCounts[d] || 0) + 1;
          const c = scan.country || "Unknown";
          countryCounts[c] = (countryCounts[c] || 0) + 1;
        }
        const uniqueCities = new Set(scans.map((s) => s.city).filter(Boolean));
        const topCountry = Object.entries(countryCounts).sort(
          (a, b) => b[1] - a[1]
        )[0];
        summary = {
          total: scans.length,
          uniqueCities: uniqueCities.size,
          topCountry: topCountry ? topCountry[0] : "N/A",
          deviceBreakdown: deviceCounts,
          countryBreakdown: countryCounts,
        };
      }

      csv = toCsv(headers, rows);
      filename = `platform-scans-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === "restaurants") {
      const restaurants = await prisma.restaurant.findMany({
        include: {
          owner: true,
          menus: true,
          _count: { select: { menus: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      headers = [
        "Name",
        "Name (AR)",
        "Slug",
        "Owner Email",
        "Phone",
        "Menus Count",
        "Created Date",
      ];
      rows = restaurants.map((r) => [
        r.name,
        r.nameAr || "",
        r.slug,
        r.owner?.email || "",
        r.phone || "",
        String(r._count.menus),
        r.createdAt.toISOString().split("T")[0],
      ]);

      if (format === "json") {
        summary = {
          total: restaurants.length,
        };
      }

      csv = toCsv(headers, rows);
      filename = `restaurants-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === "subscriptions") {
      const subscriptions = await prisma.subscription.findMany({
        include: {
          user: {
            include: { restaurant: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      headers = [
        "User Email",
        "Restaurant",
        "Tier",
        "Status",
        "Price",
        "VAT",
        "Period Start",
        "Period End",
        "Created Date",
      ];
      rows = subscriptions.map((sub) => [
        sub.user?.email || "",
        sub.user?.restaurant?.name || "",
        sub.tier,
        sub.status,
        String(sub.priceAmount),
        String(sub.vatAmount),
        sub.currentPeriodStart.toISOString().split("T")[0],
        sub.currentPeriodEnd
          ? sub.currentPeriodEnd.toISOString().split("T")[0]
          : "",
        sub.createdAt.toISOString().split("T")[0],
      ]);

      if (format === "json") {
        const tierCounts: Record<string, number> = {};
        const statusCounts: Record<string, number> = {};
        let totalRevenue = 0;
        for (const sub of subscriptions) {
          tierCounts[sub.tier] = (tierCounts[sub.tier] || 0) + 1;
          statusCounts[sub.status] = (statusCounts[sub.status] || 0) + 1;
          totalRevenue += Number(sub.priceAmount);
        }
        summary = {
          total: subscriptions.length,
          tierBreakdown: tierCounts,
          statusBreakdown: statusCounts,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
        };
      }

      csv = toCsv(headers, rows);
      filename = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === "feedback") {
      const feedback = await prisma.customerFeedback.findMany({
        where:
          Object.keys(dateFilter).length > 0
            ? { createdAt: dateFilter }
            : {},
        include: {
          menu: {
            include: { restaurant: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      headers = [
        "Date",
        "Rating (1-5)",
        "Comment",
        "Restaurant",
        "Menu",
      ];
      rows = feedback.map((fb) => [
        fb.createdAt.toISOString().split("T")[0],
        String(fb.rating),
        fb.comment || "",
        fb.menu?.restaurant?.name || "",
        fb.menu?.name || "",
      ]);

      if (format === "json") {
        const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let ratingSum = 0;
        for (const fb of feedback) {
          ratingDist[fb.rating] = (ratingDist[fb.rating] || 0) + 1;
          ratingSum += fb.rating;
        }
        summary = {
          total: feedback.length,
          averageRating:
            feedback.length > 0
              ? Math.round((ratingSum / feedback.length) * 10) / 10
              : 0,
          ratingDistribution: ratingDist,
        };
      }

      csv = toCsv(headers, rows);
      filename = `platform-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    if (format === "json") {
      return NextResponse.json({ headers, rows, summary });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
