"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  QrCode,
  BarChart3,
  Palette,
  Languages,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp, staggerContainer, staggerItem } from "@/components/animations";

export default function FeaturesPage() {
  const t = useTranslations("landing.features");
  const tc = useTranslations("landing.cta");

  const features = [
    { icon: UtensilsCrossed, key: "menuBuilder" as const },
    { icon: QrCode, key: "qrCodes" as const },
    { icon: BarChart3, key: "analytics" as const },
    { icon: Palette, key: "themes" as const },
    { icon: Languages, key: "multilingual" as const },
    { icon: ShieldCheck, key: "allergens" as const },
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

      {/* Features grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.key}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group rounded-2xl border border-gray-100 p-8 transition hover:border-indigo-100 hover:shadow-lg"
              >
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 transition group-hover:bg-indigo-100"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <feature.icon className="h-7 w-7 text-indigo-600" />
                </motion.div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="mt-3 leading-relaxed text-gray-600">
                  {t(`${feature.key}.description`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-16 text-center shadow-xl sm:px-16">
              {[
                { top: "15%", left: "8%", size: 5, dur: 3.5, del: 0 },
                { top: "25%", right: "12%", size: 4, dur: 4, del: 0.6 },
                { top: "65%", left: "18%", size: 6, dur: 3, del: 1.2 },
                { top: "55%", right: "20%", size: 3, dur: 4.5, del: 0.3 },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute hidden rounded-full bg-white/20 sm:block"
                  style={{
                    top: p.top,
                    left: "left" in p ? p.left : undefined,
                    right: "right" in p ? p.right : undefined,
                    width: p.size,
                    height: p.size,
                  }}
                  animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.del }}
                />
              ))}
              <h2 className="relative text-3xl font-bold text-white">
                {tc("title")}
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-lg text-indigo-100">
                {tc("subtitle")}
              </p>
              <Link
                href="/auth/onboarding"
                className="group relative mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50"
              >
                <span className="absolute inset-0 rounded-xl bg-indigo-200/30 opacity-0 transition group-hover:animate-ping" />
                {tc("button")}
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </main>
  );
}
