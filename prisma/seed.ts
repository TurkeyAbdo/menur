import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed themes (11 total: 3 free + 8 pro)
  const themes = [
    // ── FREE THEMES ──────────────────────────────────────────
    // Each free theme has a UNIQUE layout + vibrant palette

    // Light — Clean contemporary café, violet primary on warm white
    {
      slug: "light",
      name: "Light",
      nameAr: "فاتح",
      isFree: true,
      config: {
        colors: {
          background: "#faf9f7",
          surface: "#ffffff",
          text: "#1c1917",
          textSecondary: "#78716c",
          primary: "#7c3aed",
          accent: "#06b6d4",
          border: "#e7e5e4",
          price: "#059669",
          unavailable: "#dc2626",
          special: "#ea580c",
        },
        fonts: {
          heading: "IBM Plex Sans Arabic",
          body: "IBM Plex Sans Arabic",
        },
        layout: {
          itemStyle: "cards",
          categoryStyle: "modern",
        },
        decoration: {
          type: "none",
        },
        features: {
          showPhotos: true,
          showDecorations: false,
          customFont: false,
        },
      },
    },

    // Dark — Sleek lounge, purple + teal neon on true black
    {
      slug: "dark",
      name: "Dark",
      nameAr: "داكن",
      isFree: true,
      config: {
        colors: {
          background: "#0a0a0a",
          surface: "#171717",
          text: "#fafafa",
          textSecondary: "#a3a3a3",
          primary: "#a78bfa",
          accent: "#2dd4bf",
          border: "#262626",
          price: "#4ade80",
          unavailable: "#f87171",
          special: "#facc15",
        },
        fonts: {
          heading: "IBM Plex Sans Arabic",
          body: "IBM Plex Sans Arabic",
        },
        layout: {
          itemStyle: "compact",
          categoryStyle: "glow",
        },
        decoration: {
          type: "none",
        },
        features: {
          showPhotos: true,
          showDecorations: false,
          customFont: false,
        },
      },
    },

    // Nature — Warm earthy artisan, amber + forest green on cream
    {
      slug: "nature",
      name: "Nature",
      nameAr: "طبيعي",
      isFree: true,
      config: {
        colors: {
          background: "#fef7ed",
          surface: "#fff7ed",
          text: "#292524",
          textSecondary: "#78716c",
          primary: "#b45309",
          accent: "#15803d",
          border: "#e7d5c0",
          price: "#15803d",
          unavailable: "#b91c1c",
          special: "#c2410c",
        },
        fonts: {
          heading: "IBM Plex Sans Arabic",
          body: "IBM Plex Sans Arabic",
        },
        layout: {
          itemStyle: "grid",
          categoryStyle: "elegant",
        },
        decoration: {
          type: "none",
        },
        features: {
          showPhotos: true,
          showDecorations: false,
          customFont: false,
        },
      },
    },

    // ── PRO THEMES ──────────────────────────────────────────
    // Each pro theme: unique layout, decoration, font, personality

    // Elegant — Fine-dining luxury, antique gold on ivory
    {
      slug: "elegant",
      name: "Elegant",
      nameAr: "أنيق",
      isFree: false,
      config: {
        colors: {
          background: "#faf6f1",
          surface: "#fffcf7",
          text: "#1a1615",
          textSecondary: "#8c7e73",
          primary: "#92702a",
          accent: "#b8860b",
          border: "#e6ddd3",
          price: "#92702a",
          unavailable: "#a0522d",
          special: "#d4a03c",
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
          color: "#b8960b",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },

    // Modern — Tech-forward, electric cyan on deep navy
    {
      slug: "modern",
      name: "Modern",
      nameAr: "عصري",
      isFree: false,
      config: {
        colors: {
          background: "#030712",
          surface: "#111827",
          text: "#f9fafb",
          textSecondary: "#9ca3af",
          primary: "#3b82f6",
          accent: "#06b6d4",
          border: "#1f2937",
          price: "#22d3ee",
          unavailable: "#ef4444",
          special: "#f59e0b",
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

    // Rose — Chic café, vivid pink + fuchsia on blush
    {
      slug: "rose",
      name: "Rose",
      nameAr: "وردي",
      isFree: false,
      config: {
        colors: {
          background: "#fdf2f8",
          surface: "#fce7f3",
          text: "#1c1917",
          textSecondary: "#9d7585",
          primary: "#db2777",
          accent: "#c026d3",
          border: "#f9a8d4",
          price: "#be185d",
          unavailable: "#dc2626",
          special: "#ea580c",
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
          color: "#f472b6",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },

    // Midnight — Dramatic noir, gold on pure black
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
          primary: "#eab308",
          accent: "#facc15",
          border: "#27272a",
          price: "#eab308",
          unavailable: "#ef4444",
          special: "#f97316",
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
          color: "#eab308",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },

    // Ocean — Coastal dining, teal + coral on deep sea
    {
      slug: "ocean",
      name: "Ocean",
      nameAr: "محيط",
      isFree: false,
      config: {
        colors: {
          background: "#042f2e",
          surface: "#0d4f4d",
          text: "#f0fdfa",
          textSecondary: "#86cec5",
          primary: "#14b8a6",
          accent: "#fb923c",
          border: "#115e59",
          price: "#2dd4bf",
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

    // Sahara — Traditional Arabic, amber + turquoise on dark coffee
    {
      slug: "sahara",
      name: "Sahara",
      nameAr: "صحراء",
      isFree: false,
      config: {
        colors: {
          background: "#1c1412",
          surface: "#2c2118",
          text: "#fde8cd",
          textSecondary: "#c9a87c",
          primary: "#d97706",
          accent: "#0d9488",
          border: "#3d2e22",
          price: "#fbbf24",
          unavailable: "#dc2626",
          special: "#0d9488",
        },
        fonts: {
          heading: "Amiri",
          body: "Cairo",
        },
        layout: {
          itemStyle: "cards",
          categoryStyle: "wave",
        },
        decoration: {
          type: "geometric",
          color: "#d97706",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },

    // Verdant — Botanical garden, deep green + lavender
    {
      slug: "verdant",
      name: "Verdant",
      nameAr: "أخضر",
      isFree: false,
      config: {
        colors: {
          background: "#052e16",
          surface: "#14532d",
          text: "#f0fdf4",
          textSecondary: "#86efac",
          primary: "#22c55e",
          accent: "#a78bfa",
          border: "#166534",
          price: "#4ade80",
          unavailable: "#fb7185",
          special: "#a78bfa",
        },
        fonts: {
          heading: "Tajawal",
          body: "Tajawal",
        },
        layout: {
          itemStyle: "magazine",
          categoryStyle: "elegant",
        },
        decoration: {
          type: "floral",
          color: "#22c55e",
        },
        features: {
          showPhotos: true,
          showDecorations: true,
          customFont: true,
        },
      },
    },

    // Ember — Grill/BBQ house, red + orange on charcoal
    {
      slug: "ember",
      name: "Ember",
      nameAr: "جمر",
      isFree: false,
      config: {
        colors: {
          background: "#1c1210",
          surface: "#291a16",
          text: "#fef2f2",
          textSecondary: "#d1a599",
          primary: "#dc2626",
          accent: "#f97316",
          border: "#3b1f18",
          price: "#fb923c",
          unavailable: "#737373",
          special: "#fbbf24",
        },
        fonts: {
          heading: "Noto Kufi Arabic",
          body: "Changa",
        },
        layout: {
          itemStyle: "list",
          categoryStyle: "accent",
        },
        decoration: {
          type: "gold-dividers",
          color: "#f97316",
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
