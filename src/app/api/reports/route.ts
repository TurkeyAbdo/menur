import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "No restaurant found" }, { status: 404 });
    }

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
        where: {
          qrCode: { menu: { restaurantId: restaurant.id } },
          ...(Object.keys(dateFilter).length > 0
            ? { timestamp: dateFilter }
            : {}),
        },
        include: {
          qrCode: {
            include: { menu: true },
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
        "QR Code Label",
        "Menu Name",
      ];
      rows = scans.map((scan) => [
        scan.timestamp.toISOString().split("T")[0],
        scan.timestamp.toISOString().split("T")[1].slice(0, 8),
        scan.deviceType || "",
        scan.city || "",
        scan.country || "",
        scan.qrCode?.label || "",
        scan.qrCode?.menu?.name || "",
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
      filename = `scans-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === "feedback") {
      const feedback = await prisma.customerFeedback.findMany({
        where: {
          menu: { restaurantId: restaurant.id },
          ...(Object.keys(dateFilter).length > 0
            ? { createdAt: dateFilter }
            : {}),
        },
        include: { menu: true },
        orderBy: { createdAt: "desc" },
      });

      headers = ["Date", "Rating (1-5)", "Comment", "Menu Name"];
      rows = feedback.map((fb) => [
        fb.createdAt.toISOString().split("T")[0],
        String(fb.rating),
        fb.comment || "",
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
      filename = `feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === "items") {
      const items = await prisma.menuItem.findMany({
        where: {
          category: { menu: { restaurantId: restaurant.id } },
        },
        include: {
          category: {
            include: { menu: true },
          },
          variants: true,
        },
        orderBy: { sortOrder: "asc" },
      });

      headers = [
        "Menu",
        "Category",
        "Item Name",
        "Item Name (AR)",
        "Price",
        "Currency",
        "Availability",
        "Allergens",
        "Dietary Tags",
        "Is Special",
      ];
      rows = items.map((item) => [
        item.category?.menu?.name || "",
        item.category?.name || "",
        item.name,
        item.nameAr || "",
        String(item.price),
        item.currency,
        item.availability,
        item.allergens.join("; "),
        item.dietaryTags.join("; "),
        item.isSpecial ? "Yes" : "No",
      ]);

      if (format === "json") {
        const categoryCounts: Record<string, number> = {};
        let priceSum = 0;
        for (const item of items) {
          const cat = item.category?.name || "Uncategorized";
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          priceSum += Number(item.price);
        }
        summary = {
          total: items.length,
          categoriesCount: Object.keys(categoryCounts).length,
          avgPrice:
            items.length > 0
              ? Math.round((priceSum / items.length) * 100) / 100
              : 0,
          categoryBreakdown: categoryCounts,
        };
      }

      csv = toCsv(headers, rows);
      filename = `menu-items-${new Date().toISOString().slice(0, 10)}.csv`;
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
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
