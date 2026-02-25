import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");
  const tc = await getTranslations("common");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-7xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        {t("pageNotFound")}
      </h1>
      <p className="mt-2 text-gray-500">{t("pageNotFoundDesc")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        {t("goHome")}
      </Link>
      <p className="mt-12 text-sm text-gray-400">{tc("appName")}</p>
    </div>
  );
}
