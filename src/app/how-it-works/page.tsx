"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { QrCode, BarChart3, UtensilsCrossed } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp, ScaleIn } from "@/components/animations";

export default function HowItWorksPage() {
  const t = useTranslations("landing.howItWorks");
  const tc = useTranslations("landing.cta");

  const steps = [
    { icon: UtensilsCrossed, key: "step1", number: "1" },
    { icon: QrCode, key: "step2", number: "2" },
    { icon: BarChart3, key: "step3", number: "3" },
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

      {/* Steps */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <FadeUp key={step.key} delay={i * 0.15}>
                <motion.div
                  className="flex flex-col items-center gap-6 sm:flex-row sm:items-start"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="flex shrink-0 flex-col items-center">
                    <motion.div
                      className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100"
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <step.icon className="h-10 w-10 text-indigo-600" />
                    </motion.div>
                    <ScaleIn delay={i * 0.15 + 0.3}>
                      <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                        {step.number}
                      </div>
                    </ScaleIn>
                  </div>
                  <div className="text-center sm:text-start">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {t(`${step.key}.title`)}
                    </h3>
                    <p className="mt-3 text-lg leading-relaxed text-gray-600">
                      {t(`${step.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
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
