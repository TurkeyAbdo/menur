import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TIER_PRICING, TierKey } from "@/lib/tiers";

// Moyasar payment callback (webhook)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("id");
    if (!paymentId) {
      return NextResponse.redirect(
        new URL("/dashboard/billing?error=missing_payment", req.url)
      );
    }

    // Verify payment with Moyasar
    const moyasarKey = process.env.MOYASAR_SECRET_KEY;
    if (!moyasarKey) {
      return NextResponse.redirect(
        new URL("/dashboard/billing?error=no_payment_config", req.url)
      );
    }

    const paymentRes = await fetch(
      `https://api.moyasar.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(moyasarKey + ":").toString("base64")}`,
        },
      }
    );

    if (!paymentRes.ok) {
      return NextResponse.redirect(
        new URL("/dashboard/billing?error=verification_failed", req.url)
      );
    }

    const payment = await paymentRes.json();

    if (payment.status !== "paid") {
      return NextResponse.redirect(
        new URL(`/dashboard/billing?error=payment_${payment.status}`, req.url)
      );
    }

    const userId = payment.metadata?.userId;
    const tier = payment.metadata?.tier as TierKey;

    if (!userId || !tier) {
      return NextResponse.redirect(
        new URL("/dashboard/billing?error=invalid_metadata", req.url)
      );
    }

    const pricing = TIER_PRICING[tier];
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier,
        status: "ACTIVE",
        priceAmount: pricing.price,
        vatAmount: pricing.vat,
        moyasarTokenId: paymentId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
      },
      create: {
        userId,
        tier,
        status: "ACTIVE",
        priceAmount: pricing.price,
        vatAmount: pricing.vat,
        moyasarTokenId: paymentId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: "SYSTEM",
        title: `Upgraded to ${pricing.label}!`,
        titleAr: `!تم الترقية إلى ${pricing.labelAr}`,
        message: `Your subscription has been upgraded to the ${pricing.label} plan.`,
        messageAr: `تم ترقية اشتراكك إلى خطة ${pricing.labelAr}.`,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/billing?success=true", req.url)
    );
  } catch (error) {
    console.error("Subscription callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/billing?error=server_error", req.url)
    );
  }
}
