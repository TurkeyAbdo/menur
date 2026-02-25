"use client";

import { useTranslations } from "next-intl";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const tc = useTranslations("common");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-gray-900">
        {t("somethingWentWrong")}
      </h1>
      <p className="mt-2 text-gray-500">{t("somethingWentWrongDesc")}</p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        {t("tryAgain")}
      </button>
      <p className="mt-12 text-sm text-gray-400">{tc("appName")}</p>
    </div>
  );
}
