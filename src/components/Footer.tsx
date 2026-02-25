"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Mail } from "lucide-react";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("landing.footer");
  const tc = useTranslations("common");

  const socialLinks = [
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: LinkedInIcon, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@menur.app", label: "Email" },
  ];

  return (
    <footer className="relative overflow-hidden bg-gray-900 text-gray-300">
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500" />

      {/* Background decorations */}
      <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <h3 className="text-xl font-bold text-white">{tc("appName")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {t("description")}
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-indigo-600 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-white">{t("product")}</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/features"
                  className="text-gray-400 transition hover:text-indigo-400"
                >
                  {t("features")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-gray-400 transition hover:text-indigo-400"
                >
                  {t("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 transition hover:text-indigo-400"
                >
                  {t("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-semibold text-white">{t("support")}</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 transition hover:text-indigo-400"
                >
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 transition hover:text-indigo-400"
                >
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 transition hover:text-indigo-400"
                >
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white">{t("newsletter")}</h4>
            <p className="mt-3 text-sm text-gray-400">
              {t("newsletterSubtitle")}
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder={t("newsletterPlaceholder")}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                {t("newsletterButton")}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {tc("appName")}. {t("rights")}.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="transition hover:text-indigo-400">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition hover:text-indigo-400">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
