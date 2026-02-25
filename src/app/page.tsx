"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  BarChart3,
  Palette,
  Languages,
  ShieldCheck,
  UtensilsCrossed,
  Check,
  Zap,
  Star,
  Crown,
  Building2,
  Sparkles,
  ChevronDown,
  Quote,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp, ScaleIn, staggerContainer, staggerItem } from "@/components/animations";
import { FloatingElements } from "@/components/illustrations";
import HeroAnimation from "@/components/HeroAnimation";

function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_60%)]" />
      <FloatingElements />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <FadeUp>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-600">
              {t("subtitle")}
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/onboarding"
                className="group relative rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
              >
                <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition group-hover:animate-ping" />
                {t("cta")}
              </Link>
              <button className="rounded-xl border border-gray-200 px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50">
                {t("secondaryCta")}
              </button>
            </div>
          </FadeUp>

          {/* Animated demo */}
          <FadeUp delay={0.5}>
            <motion.div
              className="mx-auto mt-16 max-w-4xl"
              whileHover={{ rotateX: -2, rotateY: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ perspective: 1000 }}
            >
              <HeroAnimation />
            </motion.div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    { icon: UtensilsCrossed, key: "menuBuilder" as const },
    { icon: QrCode, key: "qrCodes" as const },
    { icon: BarChart3, key: "analytics" as const },
    { icon: Palette, key: "themes" as const },
    { icon: Languages, key: "multilingual" as const },
    { icon: ShieldCheck, key: "allergens" as const },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("title")}
          </h2>
        </FadeUp>
        <motion.div
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
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
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 transition group-hover:bg-indigo-100"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <feature.icon className="h-6 w-6 text-indigo-600" />
              </motion.div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="mt-2 text-gray-600">
                {t(`${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");

  const steps = [
    { icon: UtensilsCrossed, key: "step1", number: "1" },
    { icon: QrCode, key: "step2", number: "2" },
    { icon: BarChart3, key: "step3", number: "3" },
  ];

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
            {t("subtitle")}
          </p>
        </FadeUp>
        <div className="relative mt-16 grid gap-12 sm:grid-cols-3">
          {/* Animated connector line (desktop only) */}
          <div className="absolute top-8 hidden items-center sm:flex ltr:left-[16.67%] ltr:right-[16.67%] rtl:left-[16.67%] rtl:right-[16.67%]">
            <motion.div
              className="h-0.5 w-full border-t-2 border-dashed border-indigo-200"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {steps.map((step, i) => (
            <FadeUp key={step.key} delay={i * 0.2}>
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
                  <step.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <ScaleIn delay={i * 0.2 + 0.3}>
                  <div className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {step.number}
                  </div>
                </ScaleIn>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="mt-2 text-gray-600">
                  {t(`${step.key}.description`)}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
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
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-center text-lg text-gray-600">{t("subtitle")}</p>
        </FadeUp>

        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
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
  );
}

const avatarColors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500"];

function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");

  const testimonials = ["t1", "t2", "t3"] as const;

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            {t("subtitle")}
          </p>
        </FadeUp>
        <motion.div
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((key, index) => (
            <motion.div
              key={key}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl border border-gray-100 bg-white p-8"
            >
              <Quote className="h-8 w-8 text-indigo-200" />
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t(`${key}.quote`)}
              </p>
              <div className="mt-6 flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((s) => (
                  <ScaleIn key={s} delay={0.1 * s}>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </ScaleIn>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[index]}`}
                >
                  {t(`${key}.name`).charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t(`${key}.name`)}</p>
                  <p className="text-sm text-gray-500">
                    {t(`${key}.role`)} — {t(`${key}.restaurant`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const t = useTranslations("landing.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = ["1", "2", "3", "4", "5", "6"] as const;

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <FadeUp>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            {t("subtitle")}
          </p>
        </FadeUp>
        <div className="mt-12 divide-y divide-gray-200">
          {faqs.map((num, index) => (
            <div key={num}>
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between py-5 text-start"
              >
                <span className="text-base font-medium text-gray-900">
                  {t(`q${num}`)}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-gray-600 leading-relaxed">
                      {t(`a${num}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations("landing.cta");

  const particles = [
    { top: "10%", left: "10%", size: 6, duration: 3, delay: 0 },
    { top: "20%", right: "15%", size: 4, duration: 4, delay: 0.5 },
    { top: "60%", left: "20%", size: 5, duration: 3.5, delay: 1 },
    { top: "70%", right: "25%", size: 3, duration: 4.5, delay: 0.8 },
    { top: "40%", left: "5%", size: 4, duration: 3.8, delay: 1.2 },
    { top: "30%", right: "8%", size: 5, duration: 3.2, delay: 0.3 },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-16 text-center shadow-xl sm:px-16 sm:py-20">
            {/* Floating particles */}
            {particles.map((p, i) => (
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
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
                }}
              />
            ))}

            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("title")}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-indigo-100">
              {t("subtitle")}
            </p>
            <Link
              href="/auth/onboarding"
              className="group relative mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50"
            >
              <span className="absolute inset-0 rounded-xl bg-indigo-200/30 opacity-0 transition group-hover:animate-ping" />
              {t("button")}
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
