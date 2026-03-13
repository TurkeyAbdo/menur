import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://menur-wheat.vercel.app";
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Menur - منيور | Digital Menu Platform",
    template: "%s — Menur",
  },
  description:
    "Create stunning digital menus, get customizable QR codes, and track scan analytics for your restaurant",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Menur",
    title: "Menur - منيور | Digital Menu Platform",
    description:
      "Create stunning digital menus, get customizable QR codes, and track scan analytics for your restaurant",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menur - منيور | Digital Menu Platform",
    description:
      "Create stunning digital menus, get customizable QR codes, and track scan analytics for your restaurant",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Menur",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
