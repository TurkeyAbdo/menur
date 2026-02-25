"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp, ScaleIn } from "@/components/animations";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

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
              {t("description")}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-6 py-16">
        <AnimatePresence mode="wait">
          {sent ? (
            <ScaleIn key="success">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  <Send className="mx-auto h-10 w-10 text-emerald-500" />
                </motion.div>
                <p className="mt-4 text-lg font-medium text-emerald-800">
                  {t("sent")}
                </p>
              </div>
            </ScaleIn>
          ) : (
            <FadeUp key="form" delay={0.2}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("nameLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("namePlaceholder")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("messageLabel")}
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t("messagePlaceholder")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                  {t("sendButton")}
                </motion.button>
              </form>
            </FadeUp>
          )}
        </AnimatePresence>

        {/* Direct email */}
        <FadeUp delay={0.4}>
          <div className="mt-12 rounded-xl border border-gray-100 p-6 text-center">
            <Mail className="mx-auto h-6 w-6 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              {t("orEmail")}{" "}
              <a
                href="mailto:support@menur.app"
                className="font-medium text-indigo-600 hover:underline"
              >
                support@menur.app
              </a>
            </p>
          </div>
        </FadeUp>
      </div>

      <Footer />
    </main>
  );
}
