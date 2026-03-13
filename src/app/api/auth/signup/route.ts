import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";
import { generateVerificationToken } from "@/lib/tokens";
import { rateLimitByIp, rateLimitResponse } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const { success } = rateLimitByIp(req, 5, 15 * 60 * 1000, "signup");
  if (!success) return rateLimitResponse();

  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "OWNER",
        provider: "EMAIL",
        subscription: {
          create: {
            tier: "FREE",
            status: "ACTIVE",
            priceAmount: 0,
            vatAmount: 0,
          },
        },
        notifications: {
          create: {
            type: "WELCOME",
            title: "Welcome to Menur!",
            titleAr: "!مرحباً بك في منيور",
            message: "Your account is ready. Start by creating your first menu and generating a QR code for your restaurant.",
            messageAr: "حسابك جاهز. ابدأ بإنشاء قائمتك الأولى وإنشاء رمز QR لمطعمك.",
          },
        },
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(name, email).catch((err) =>
      logger.error("Failed to send welcome email", { error: String(err) })
    );

    // Send verification email (non-blocking)
    generateVerificationToken(email)
      .then(({ token }) => sendVerificationEmail(email, token))
      .catch((err) => logger.error("Failed to send verification email", { error: String(err) }));

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Signup error", { error: String(error) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}