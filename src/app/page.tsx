"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  QrCode,
  BarChart3,
  Palette,
  Languages,
  ShieldCheck,
  UtensilsCrossed,
  Check,
  Menu,
  X,
  Globe,
} from "lucide-react";

function LanguageSwitcher() {
  const [locale, setLocale] = useState("ar");

  useEffect(() => {
    setLocale(document.documentElement.lang || "ar");
  }, []);

  const switchLocale = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    window.location.reload();
  };

  return (
    <button
      onClick={() => switchLocale(locale === "ar" ? "en" : "ar")}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === "ar" ? "EN" : "عربي"}</span>
    </button>
  );
}

function Navbar() {
  const t = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          {t("appName")}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {t("login")}
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            {t("signup")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <LanguageSwitcher />
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              {t("signup")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />
      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-600">
          {t("subtitle")}
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/signup"
            className="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
          >
            {t("cta")}
          </Link>
          <button className="rounded-xl border border-gray-200 px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50">
            {t("secondaryCta")}
          </button>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: UtensilsCrossed,
      key: "menuBuilder" as const,
    },
    {
      icon: QrCode,
      key: "qrCodes" as const,
    },
    {
      icon: BarChart3,
      key: "analytics" as const,
    },
    {
      icon: Palette,
      key: "themes" as const,
    },
    {
      icon: Languages,
      key: "multilingual" as const,
    },
    {
      icon: ShieldCheck,
      key: "allergens" as const,
    },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t("title")}
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="rounded-2xl border border-gray-100 p-8 transition hover:border-indigo-100 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <feature.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="mt-2 text-gray-600">
                {t(`${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const t = useTranslations("landing.pricing");

  const tiers = [
    {
      key: "free" as const,
      features: [
        "1 menu",
        "1 QR code",
        "1 location",
        "30 items",
        "Light & Dark themes",
      ],
      cta: t("startFree"),
      popular: false,
    },
    {
      key: "basic" as const,
      features: [
        "3 menus",
        "3 QR codes",
        "100 items",
        "All themes",
        "Item photos",
        "2 languages",
        "Basic analytics",
      ],
      cta: t("subscribe"),
      popular: false,
    },
    {
      key: "pro" as const,
      features: [
        "Unlimited menus",
        "Unlimited QR codes",
        "5 locations",
        "Unlimited items",
        "All themes",
        "Unlimited languages",
        "Full analytics",
        "Custom domain",
      ],
      cta: t("subscribe"),
      popular: true,
    },
    {
      key: "enterprise" as const,
      features: [
        "Everything in Pro",
        "Unlimited locations",
        "Custom branding",
        "Priority support",
        "Dedicated manager",
      ],
      cta: t("contactUs"),
      popular: false,
    },
  ];

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-6 text-center text-lg text-gray-600">{t("subtitle")}</p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative rounded-2xl bg-white p-8 shadow-sm ${
                tier.popular
                  ? "ring-2 ring-indigo-600 shadow-lg"
                  : "border border-gray-200"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                  {t(`${tier.key}.badge`)}
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {t(`${tier.key}.name`)}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  {t(`${tier.key}.price`)}
                </span>
                <span className="text-sm text-gray-500">
                  {t(`${tier.key}.period`)}
                </span>
              </div>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                  tier.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {t("vatNote")}
        </p>
      </div>
    </section>
  );
}

function Footer() {
  const t = useTranslations("landing.footer");
  const tc = useTranslations("common");

  return (
    <footer className="border-t border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold text-indigo-600">
              {tc("appName")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">{t("description")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{t("product")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-indigo-600">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-600">
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{t("support")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-indigo-600">
                  {t("help")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-600">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{t("legal")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-indigo-600">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-600">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {tc("appName")}. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
