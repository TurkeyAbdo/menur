import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { UtensilsCrossed, QrCode, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeUp, HoverLift, StaggerGrid, StaggerItem } from "@/components/animations";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("title"),
    description: t("heroText"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  const icons = [
    { icon: UtensilsCrossed, color: "bg-indigo-50 text-indigo-600" },
    { icon: QrCode, color: "bg-emerald-50 text-emerald-600" },
    { icon: BarChart3, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <FadeUp>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t("title")}
            </h1>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              {t("heroText")}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-16">
          {/* Mission */}
          <FadeUp>
            <section className="rounded-2xl border border-gray-100 p-8 transition hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900">{t("mission")}</h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                {t("missionText")}
              </p>
            </section>
          </FadeUp>

          {/* What We Offer */}
          <FadeUp delay={0.1}>
            <section>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("whatWeOffer")}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                {t("whatWeOfferText")}
              </p>
              <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-3">
                {icons.map(({ icon: Icon, color }, i) => (
                  <StaggerItem key={i}>
                    <HoverLift className="flex justify-center rounded-xl border border-gray-100 p-6 transition hover:border-indigo-100 hover:shadow-md">
                      <Icon className={`h-10 w-10 ${color}`} />
                    </HoverLift>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </section>
          </FadeUp>

          {/* Why Menur */}
          <FadeUp delay={0.2}>
            <section className="rounded-2xl bg-indigo-50 p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("whyMenur")}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-700">
                {t("whyMenurText")}
              </p>
            </section>
          </FadeUp>
        </div>
      </div>

      <Footer />
    </main>
  );
}
