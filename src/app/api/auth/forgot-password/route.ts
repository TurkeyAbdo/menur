import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimitByIp, rateLimitResponse } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const { success } = rateLimitByIp(req, 5, 15 * 60 * 1000, "forgot-password");
  if (!success) return rateLimitResponse();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Always return same response to prevent email enumeration
    const genericResponse = NextResponse.json({
      message: "If an account exists with that email, a reset link has been sent",
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Only send for EMAIL provider users who have a password
    if (user && user.provider === "EMAIL" && user.password) {
      const { token } = await generatePasswordResetToken(email);
      sendPasswordResetEmail(email, token).catch((err) =>
        logger.error("Failed to send password reset email", { error: String(err) })
      );
    }

    return genericResponse;
  } catch (error) {
    logger.error("Forgot password error", { error: String(error) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
