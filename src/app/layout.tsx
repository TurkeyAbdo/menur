import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://menur.app"),
  title: {
    default: "Menur - منيور | Digital Menu Platform",
    template: "%s — Menur",
  },
  description:
    "Create stunning digital menus, get customizable QR codes, and track scan analytics for your restaurant",
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
