"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Star,
  Crown,
  Building2,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp, staggerContainer, staggerItem } from "@/components/animations";

export default function PricingPage() {
  const t = useTranslations("landing.pricing");
  const td = useTranslations("dashboard");

  const tiers = [
    {
      key: "free" as const,
      icon: Zap,
      color: "bg-gray-50",
      iconColor: "text-gray-600",
      features: [
        td("planFeatures.freeMenus"),
        td("planFeatures.freeItems"),
        td("planFeatures.freeQR"),
        td("planFeatures.freeLocations"),
        td("planFeatures.freeThemes"),
        td("planFeatures.freeLangs"),
      ],
      limits: [
        td("planFeatures.noAnalytics"),
        td("planFeatures.noPhotos"),
        td("planFeatures.poweredBadge"),
      ],
      cta: t("startFree"),
      popular: false,
    },
    {
      key: "basic" as const,
      icon: Star,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      features: [
        td("planFeatures.basicMenus"),
        td("planFeatures.basicItems"),
        td("planFeatures.basicQR"),
        td("planFeatures.basicLocations"),
        td("planFeatures.allThemes"),
        td("planFeatures.basicLangs"),
        td("planFeatures.basicAnalytics"),
        td("planFeatures.itemPhotos"),
      ],
      limits: [td("planFeatures.noCustomDomain")],
      cta: t("subscribe"),
      popular: false,
    },
    {
      key: "pro" as const,
      icon: Crown,
      color: "bg-indigo-50",
      iconColor: "text-indigo-600",
      features: [
        td("planFeatures.unlimitedMenus"),
        td("planFeatures.unlimitedItems"),
        td("planFeatures.unlimitedQR"),
        td("planFeatures.proLocations"),
        td("planFeatures.allThemes"),
        td("planFeatures.unlimitedLangs"),
        td("planFeatures.fullAnalytics"),
        td("planFeatures.itemPhotos"),
        td("planFeatures.customDomain"),
      ],
      limits: [],
      cta: t("subscribe"),
      popular: true,
    },
    {
      key: "enterprise" as const,
      icon: Building2,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      features: [
        td("planFeatures.everythingPro"),
        td("planFeatures.unlimitedLocations"),
        td("planFeatures.customBranding"),
        td("planFeatures.prioritySupport"),
        td("planFeatures.dedicatedManager"),
      ],
      limits: [],
      cta: t("contactUs"),
      popular: false,
    },
  ];

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <FadeUp>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t("title")}
            </h1>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              {t("subtitle")}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {tiers.map((tier) => {
              const Icon = tier.icon;

              return (
                <motion.div
                  key={tier.key}
                  variants={staggerItem}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative rounded-2xl bg-white p-8 transition ${
                    tier.popular
                      ? "ring-2 ring-indigo-600 shadow-lg animate-glow-pulse"
                      : "border border-gray-200 shadow-sm hover:shadow-lg"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                        <Sparkles className="h-3 w-3" />
                        {t(`${tier.key}.badge`)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${tier.color}`}
                    >
                      <Icon className={`h-5 w-5 ${tier.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t(`${tier.key}.name`)}
                    </h3>
                  </div>

                  <div className="mt-5">
                    <span className="text-4xl font-bold text-gray-900">
                      {t(`${tier.key}.price`)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {" "}{t(`${tier.key}.period`)}
                    </span>
                    {Number(t(`${tier.key}.price`)) > 0 && (
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {td("inclVAT")}
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2.5 border-t border-gray-100 pt-6">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                    {tier.limits.map((l) => (
                      <li
                        key={l}
                        className="flex items-start gap-2 text-sm text-gray-400"
                      >
                        <span className="mt-0.5 h-3.5 w-3.5 shrink-0 text-center text-[10px]">
                          &mdash;
                        </span>
                        {l}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/onboarding"
                    className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                      tier.popular
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <FadeUp delay={0.3}>
            <p className="mt-10 text-center text-sm text-gray-500">
              {t("vatNote")}
            </p>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </main>
  );
}
