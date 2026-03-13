"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("errors.passwordMin"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus("success");
      } else if (res.status === 429) {
        setError(t("errors.tooManyRequests"));
      } else {
        const data = await res.json();
        if (data.error?.includes("expired") || data.error?.includes("Invalid")) {
          setStatus("error");
        } else {
          setError(data.error || t("errors.somethingWrong"));
        }
      }
    } catch {
      setError(t("errors.somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-3xl font-bold text-indigo-600">Menur</Link>
          <div className="mt-8 rounded-lg bg-red-50 p-6">
            <p className="text-red-800">{t("resetPasswordExpired")}</p>
            <Link href="/auth/forgot-password" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              {t("forgotPasswordTitle")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-3xl font-bold text-indigo-600">Menur</Link>
          <div className="mt-8 rounded-lg bg-green-50 p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-green-800">{t("resetPasswordSuccess")}</p>
            <Link href="/auth/login" className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
              {t("loginButton")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-3xl font-bold text-indigo-600">Menur</Link>
          <div className="mt-8 rounded-lg bg-red-50 p-6">
            <p className="text-red-800">{t("resetPasswordExpired")}</p>
            <Link href="/auth/forgot-password" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              {t("forgotPasswordTitle")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-indigo-600">Menur</Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">{t("resetPasswordTitle")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("newPassword")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t("confirmPassword")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "..." : t("resetPasswordButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
