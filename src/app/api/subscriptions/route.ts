import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TIER_PRICING, TierKey } from "@/lib/tiers";

// GET current subscription
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      // Create a free subscription if none exists
      const newSub = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          tier: "FREE",
          status: "ACTIVE",
          priceAmount: 0,
          vatAmount: 0,
        },
      });
      return NextResponse.json({ subscription: newSub });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("GET /api/subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - initiate subscription upgrade via Moyasar
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();

    if (!["BASIC", "PRO", "ENTERPRISE"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    const pricing = TIER_PRICING[tier as TierKey];
    const totalAmount = Math.round((pricing.price + pricing.vat) * 100); // Moyasar expects amount in halalas

    const moyasarKey = process.env.MOYASAR_SECRET_KEY;

    if (!moyasarKey) {
      // Test mode: directly upgrade without payment
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: {
          tier: tier as TierKey,
          status: "ACTIVE",
          priceAmount: pricing.price,
          vatAmount: pricing.vat,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
        create: {
          userId: session.user.id,
          tier: tier as TierKey,
          status: "ACTIVE",
          priceAmount: pricing.price,
          vatAmount: pricing.vat,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });

      // Create upgrade notification
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "SYSTEM",
          title: `Upgraded to ${pricing.label}!`,
          titleAr: `!تم الترقية إلى ${pricing.labelAr}`,
          message: `Your subscription has been upgraded to the ${pricing.label} plan. Enjoy your new features!`,
          messageAr: `تم ترقية اشتراكك إلى خطة ${pricing.labelAr}. استمتع بالمميزات الجديدة!`,
        },
      });

      return NextResponse.json({
        subscription,
        mode: "test",
        message: "Upgraded in test mode (no Moyasar key configured)",
      });
    }

    // Production mode: Create Moyasar payment
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/subscriptions/callback`;

    const moyasarRes = await fetch("https://api.moyasar.com/v1/invoices", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(moyasarKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "SAR",
        description: `Menur ${pricing.label} Plan - Monthly Subscription`,
        callback_url: callbackUrl,
        metadata: {
          userId: session.user.id,
          tier,
        },
      }),
    });

    if (!moyasarRes.ok) {
      const err = await moyasarRes.json();
      console.error("Moyasar error:", err);
      return NextResponse.json(
        { error: "Payment initiation failed" },
        { status: 500 }
      );
    }

    const invoice = await moyasarRes.json();

    return NextResponse.json({
      paymentUrl: invoice.url,
      invoiceId: invoice.id,
    });
  } catch (error) {
    console.error("POST /api/subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - cancel subscription
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === "cancel") {
      const subscription = await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // Downgrade to FREE at end of period
      // For now, downgrade immediately in test mode
      if (!process.env.MOYASAR_SECRET_KEY) {
        await prisma.subscription.update({
          where: { userId: session.user.id },
          data: {
            tier: "FREE",
            status: "ACTIVE",
            priceAmount: 0,
            vatAmount: 0,
            cancelledAt: null,
          },
        });
      }

      // Create cancellation notification
      const previousTier = subscription.tier;
      const previousPricing = TIER_PRICING[previousTier as TierKey];
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "SYSTEM",
          title: `Subscription cancelled`,
          titleAr: `تم إلغاء الاشتراك`,
          message: `Your ${previousPricing?.label || previousTier} plan has been cancelled. You have been downgraded to the Free plan.`,
          messageAr: `تم إلغاء خطة ${previousPricing?.labelAr || previousTier}. تم تخفيض اشتراكك إلى الخطة المجانية.`,
        },
      });

      return NextResponse.json({ subscription, message: "Subscription cancelled" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
