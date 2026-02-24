import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed themes
  await prisma.theme.upsert({
    where: { slug: "light" },
    update: {},
    create: {
      name: "Light",
      nameAr: "فاتح",
      slug: "light",
      isFree: true,
      isActive: true,
      config: {
        colors: {
          background: "#ffffff",
          surface: "#f9fafb",
          text: "#111827",
          textSecondary: "#6b7280",
          primary: "#6366f1",
          accent: "#10b981",
          border: "#e5e7eb",
          price: "#059669",
          unavailable: "#ef4444",
          special: "#f59e0b",
        },
        fonts: {
          heading: "IBM Plex Sans Arabic",
          body: "IBM Plex Sans Arabic",
        },
      },
    },
  });

  await prisma.theme.upsert({
    where: { slug: "dark" },
    update: {},
    create: {
      name: "Dark",
      nameAr: "داكن",
      slug: "dark",
      isFree: true,
      isActive: true,
      config: {
        colors: {
          background: "#111827",
          surface: "#1f2937",
          text: "#f9fafb",
          textSecondary: "#9ca3af",
          primary: "#818cf8",
          accent: "#34d399",
          border: "#374151",
          price: "#34d399",
          unavailable: "#f87171",
          special: "#fbbf24",
        },
        fonts: {
          heading: "IBM Plex Sans Arabic",
          body: "IBM Plex Sans Arabic",
        },
      },
    },
  });

  await prisma.theme.upsert({
    where: { slug: "elegant" },
    update: {},
    create: {
      name: "Elegant",
      nameAr: "أنيق",
      slug: "elegant",
      isFree: false,
      isActive: true,
      config: {
        colors: {
          background: "#faf7f2",
          surface: "#ffffff",
          text: "#1a1a1a",
          textSecondary: "#7a7a7a",
          primary: "#8b6f47",
          accent: "#c5a572",
          border: "#e8e0d4",
          price: "#8b6f47",
          unavailable: "#c0392b",
          special: "#d4a843",
        },
        fonts: {
          heading: "Georgia",
          body: "IBM Plex Sans Arabic",
        },
      },
    },
  });

  await prisma.theme.upsert({
    where: { slug: "modern" },
    update: {},
    create: {
      name: "Modern",
      nameAr: "عصري",
      slug: "modern",
      isFree: false,
      isActive: true,
      config: {
        colors: {
          background: "#0f172a",
          surface: "#1e293b",
          text: "#e2e8f0",
          textSecondary: "#94a3b8",
          primary: "#3b82f6",
          accent: "#22d3ee",
          border: "#334155",
          price: "#22d3ee",
          unavailable: "#ef4444",
          special: "#eab308",
        },
        fonts: {
          heading: "IBM Plex Sans Arabic",
          body: "IBM Plex Sans Arabic",
        },
      },
    },
  });

  // Seed platform settings
  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      maxPhotoSizeMB: 5,
      defaultCurrency: "SAR",
      vatPercentage: 15.0,
    },
  });

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
