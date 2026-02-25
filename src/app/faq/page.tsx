"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp } from "@/components/animations";

export default function FAQPage() {
  const t = useTranslations("landing.faq");
  const tc = useTranslations("landing.cta");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = ["1", "2", "3", "4", "5", "6"] as const;

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

      {/* FAQ accordion */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <FadeUp>
            <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200">
              {faqs.map((num, index) => (
                <div key={num}>
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-start"
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
                        <p className="px-6 pb-5 text-gray-600 leading-relaxed">
                          {t(`a${num}`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </FadeUp>
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
