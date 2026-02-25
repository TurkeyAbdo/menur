import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp } from "@/components/animations";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");

  const sections = [
    { title: t("acceptance"), text: t("acceptanceText") },
    { title: t("accounts"), text: t("accountsText") },
    { title: t("content"), text: t("contentText") },
    { title: t("acceptableUse"), text: t("acceptableUseText") },
    { title: t("payment"), text: t("paymentText") },
    { title: t("liability"), text: t("liabilityText") },
    { title: t("termination"), text: t("terminationText") },
    { title: t("changes"), text: t("changesText") },
  ];

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-10 sm:pt-44 sm:pb-14">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <FadeUp>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-sm text-gray-500">{t("lastUpdated")}</p>
          </FadeUp>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <FadeUp>
          <p className="text-lg leading-relaxed text-gray-600">{t("intro")}</p>
        </FadeUp>

        <div className="mt-12 space-y-10">
          {sections.map((section, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <section className="rounded-xl border border-transparent p-0 transition hover:border-gray-100 hover:bg-gray-50/50 hover:p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="mt-3 leading-relaxed text-gray-600">
                  {section.text}
                </p>
              </section>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.4}>
          <div className="mt-12 rounded-xl border border-gray-100 p-6 text-sm text-gray-500 transition hover:shadow-md">
            {t("contactUs")}{" "}
            <a
              href="mailto:support@menur.app"
              className="font-medium text-indigo-600 hover:underline"
            >
              support@menur.app
            </a>
          </div>
        </FadeUp>
      </div>

      <Footer />
    </main>
  );
}
