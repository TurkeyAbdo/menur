import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed themes (8 total: 3 free + 5 pro)
  const themes = [
    // ── FREE THEMES ──────────────────────────────────────────
    {
      slug: "light",
      name: "Light",
      nameAr: "فاتح",
      isFree: true,
      config: {
        colors: {
          background: "#ffffff",
          surface: "#f8fafc",
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
        layout: {
          itemStyle: "list",
          categoryStyle: "simple",
        },
        decoration: {
          type: "none",
        },
        features: {
          showPhotos: false,
          showDecorations: false,
          customFont: false,
        },
      },
    },
    {
      slug: "dark",
      name: "Dark",
      nameAr: "داكن",
      isFree: true,
      config: {
        colors: {
          background: "#0f172a",
          surface: "#1e293b",
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
        layout: {
          itemStyle: "list",
          categoryStyle: "simple",
        },
        decoration: {
          type: "none",
        },
        features: {
          showPhotos: false,
          showDecorations: false,
          customFont: false,
        },
      },
    },
    {
      slug: "nature",
      name: "Nature",
      nameAr: "طبيعي",
      isFree: true,
      config: {
        colors: {
          background: "#fefdf8",
          surface: "#f5f0e8",
          text: "#1a1a1a",
          textSecondary: "#6b6b5e",
          primary: "#5a7a5c",
          accent: "#a3825a",
          border: "#e0d9cc",
          price: "#5a7a5c",
          unavailable: "#c0392b",
          special: "#d4a843",
        },
        fonts: {
          heading: "IBM Plex Sans Arabic",
          body: "IBM Plex Sans Arabic",
        },
        layout: {
          itemStyle: "list",
          categoryStyle: "simple",
        },
        decoration: {
          type: "none",
        },
        features: {
          showPhotos: false,
          showDecorations: false,
          customFont: false,
        },
      },
    },

    // ── PRO THEMES ──────────────────────────────────────────
    {
      slug: "elegant",
      name: "Elegant",
      nameAr: "أنيق",
      isFree: false,
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
          heading: "Amiri",
          body: "Amiri",
        },
        layout: {
          itemStyle: "cards",
          categoryStyle: "elegant",
        },
        decoration: {
          type: "gold-dividers",
          color: "#c5a572",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },
    {
      slug: "modern",
      name: "Modern",
      nameAr: "عصري",
      isFree: false,
      config: {
        colors: {
          background: "#0c1222",
          surface: "#162032",
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
          heading: "Cairo",
          body: "Cairo",
        },
        layout: {
          itemStyle: "grid",
          categoryStyle: "modern",
        },
        decoration: {
          type: "geometric",
          color: "#3b82f6",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },
    {
      slug: "rose",
      name: "Rose",
      nameAr: "وردي",
      isFree: false,
      config: {
        colors: {
          background: "#fdf2f4",
          surface: "#ffffff",
          text: "#1a1a1a",
          textSecondary: "#78716c",
          primary: "#be185d",
          accent: "#ec4899",
          border: "#f5d0d8",
          price: "#be185d",
          unavailable: "#dc2626",
          special: "#f59e0b",
        },
        fonts: {
          heading: "Tajawal",
          body: "Tajawal",
        },
        layout: {
          itemStyle: "compact",
          categoryStyle: "accent",
        },
        decoration: {
          type: "floral",
          color: "#ec4899",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },
    {
      slug: "midnight",
      name: "Midnight",
      nameAr: "منتصف الليل",
      isFree: false,
      config: {
        colors: {
          background: "#09090b",
          surface: "#18181b",
          text: "#fafafa",
          textSecondary: "#a1a1aa",
          primary: "#f59e0b",
          accent: "#fbbf24",
          border: "#27272a",
          price: "#f59e0b",
          unavailable: "#ef4444",
          special: "#fbbf24",
        },
        fonts: {
          heading: "Noto Kufi Arabic",
          body: "Noto Kufi Arabic",
        },
        layout: {
          itemStyle: "overlay",
          categoryStyle: "glow",
        },
        decoration: {
          type: "stars",
          color: "#fbbf24",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },
    {
      slug: "ocean",
      name: "Ocean",
      nameAr: "محيط",
      isFree: false,
      config: {
        colors: {
          background: "#042f2e",
          surface: "#0d3d3b",
          text: "#f0fdfa",
          textSecondary: "#99c7c1",
          primary: "#14b8a6",
          accent: "#fb923c",
          border: "#1a4d4a",
          price: "#14b8a6",
          unavailable: "#f87171",
          special: "#fb923c",
        },
        fonts: {
          heading: "Changa",
          body: "Changa",
        },
        layout: {
          itemStyle: "magazine",
          categoryStyle: "wave",
        },
        decoration: {
          type: "waves",
          color: "#14b8a6",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },
  ];

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: { config: theme.config, nameAr: theme.nameAr, isFree: theme.isFree },
      create: {
        name: theme.name,
        nameAr: theme.nameAr,
        slug: theme.slug,
        isFree: theme.isFree,
        isActive: true,
        config: theme.config,
      },
    });
  }

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

  // Seed admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  await prisma.user.upsert({
    where: { email: "admin@menur.app" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@menur.app",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
      provider: "EMAIL",
    },
  });

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
