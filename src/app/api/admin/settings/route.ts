import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { error, status } = await requireAdmin();
    if (error) return NextResponse.json({ error }, { status: status! });

    let settings = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: "default",
          maxPhotoSizeMB: 5,
          defaultCurrency: "SAR",
          vatPercentage: 15.0,
        },
      });
    }

    return NextResponse.json({
      maxPhotoSizeMB: settings.maxPhotoSizeMB,
      defaultCurrency: settings.defaultCurrency,
      supportedCurrencies: settings.supportedCurrencies,
      vatPercentage: Number(settings.vatPercentage),
      maintenanceMode: settings.maintenanceMode,
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return NextResponse.json({ error }, { status: status! });

    const body = await request.json();
    const { maxPhotoSizeMB, defaultCurrency, vatPercentage, maintenanceMode } =
      body;

    const settings = await prisma.platformSettings.update({
      where: { id: "default" },
      data: {
        ...(maxPhotoSizeMB !== undefined && {
          maxPhotoSizeMB: parseInt(maxPhotoSizeMB),
        }),
        ...(defaultCurrency !== undefined && { defaultCurrency }),
        ...(vatPercentage !== undefined && {
          vatPercentage: parseFloat(vatPercentage),
        }),
        ...(maintenanceMode !== undefined && { maintenanceMode }),
      },
    });

    return NextResponse.json({
      maxPhotoSizeMB: settings.maxPhotoSizeMB,
      defaultCurrency: settings.defaultCurrency,
      supportedCurrencies: settings.supportedCurrencies,
      vatPercentage: Number(settings.vatPercentage),
      maintenanceMode: settings.maintenanceMode,
    });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
