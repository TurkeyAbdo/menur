import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { sendWelcomeEmail } from "./email";
import { Role, AuthProvider } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth sign-ins, set up first-time users with subscription + notification
      if (
        account?.provider === "google" ||
        account?.provider === "facebook"
      ) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { subscription: true },
          });

          if (dbUser && !dbUser.subscription) {
            const provider: AuthProvider =
              account.provider === "google" ? "GOOGLE" : "FACEBOOK";

            await prisma.$transaction([
              prisma.user.update({
                where: { id: user.id },
                data: { provider },
              }),
              prisma.subscription.create({
                data: {
                  userId: user.id,
                  tier: "FREE",
                  status: "ACTIVE",
                  priceAmount: 0,
                  vatAmount: 0,
                },
              }),
              prisma.notification.create({
                data: {
                  userId: user.id,
                  type: "WELCOME",
                  title: "Welcome to Menur!",
                  titleAr: "!مرحباً بك في منيور",
                  message:
                    "Your account is ready. Start by creating your first menu and generating a QR code for your restaurant.",
                  messageAr:
                    "حسابك جاهز. ابدأ بإنشاء قائمتك الأولى وإنشاء رمز QR لمطعمك.",
                },
              }),
            ]);

            if (dbUser.name && dbUser.email) {
              sendWelcomeEmail(dbUser.name, dbUser.email).catch((err) =>
                console.error("Failed to send welcome email:", err)
              );
            }
          }
        } catch (err) {
          console.error("OAuth user setup error:", err);
          // Don't block sign-in if setup fails
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string; role: Role }).id =
          token.id as string;
        (session.user as { id: string; role: Role }).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/dashboard",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
