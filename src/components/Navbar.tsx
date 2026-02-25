"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";

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
      <span>{locale === "ar" ? "EN" : "\u0639\u0631\u0628\u064A"}</span>
    </button>
  );
}

export default function Navbar() {
  const t = useTranslations("common");
  const tn = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const navLinks = [
    { href: "/features", label: tn("features") },
    { href: "/how-it-works", label: tn("howItWorks") },
    { href: "/pricing", label: tn("pricing") },
    { href: "/faq", label: tn("faq") },
    { href: "/about", label: tn("about") },
    { href: "/contact", label: tn("contact") },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          {t("appName")}
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {t("login")}
          </Link>
          <Link
            href="/auth/onboarding"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            {t("signup")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
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
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-gray-100 pt-3">
              <LanguageSwitcher />
              <Link
                href="/auth/login"
                className="mt-2 block rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {t("login")}
              </Link>
              <Link
                href="/auth/onboarding"
                className="mt-2 block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                {t("signup")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
