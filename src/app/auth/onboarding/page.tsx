"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Globe,
  UtensilsCrossed,
  Target,
  CreditCard,
  UserPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Zap,
  Star,
  Crown,
  Building2,
} from "lucide-react";

const STEPS = 5;

const CITY_KEYS = [
  "riyadh", "jeddah", "makkah", "madinah", "dammam", "khobar",
  "dhahran", "tabuk", "abha", "taif", "hail", "jazan", "najran", "yanbu", "alahsa",
] as const;

const CUISINE_KEYS = [
  "saudi", "yemeni", "lebanese", "egyptian", "indian", "pakistani",
  "turkish", "italian", "asian", "burgers", "cafe", "seafood", "mixed",
] as const;

const GOAL_KEYS = [
  "digitalMenus", "qrCodes", "analytics", "multipleLocations", "customBranding",
] as const;

interface OnboardingData {
  language: string;
  restaurantName: string;
  city: string;
  cuisine: string;
  goals: string[];
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function getRecommendedTier(goals: string[]): "free" | "basic" | "pro" | "enterprise" {
  if (goals.includes("customBranding")) return "enterprise";
  if (goals.includes("multipleLocations")) return "pro";
  if (goals.includes("qrCodes") || goals.includes("analytics")) return "basic";
  return "free";
}

const TIER_PRICES: Record<string, string> = {
  free: "0",
  basic: "34",
  pro: "109",
  enterprise: "296",
};

const TIER_ICONS: Record<string, typeof Zap> = {
  free: Zap,
  basic: Star,
  pro: Crown,
  enterprise: Building2,
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-50 text-gray-600",
  basic: "bg-blue-50 text-blue-600",
  pro: "bg-indigo-50 text-indigo-600",
  enterprise: "bg-purple-50 text-purple-600",
};

const TIER_FEATURES: Record<string, string[]> = {
  free: ["freeMenus", "freeItems", "freeQR", "freeLocations", "freeThemes"],
  basic: ["basicMenus", "basicItems", "basicQR", "allThemes", "basicAnalytics", "itemPhotos"],
  pro: ["unlimitedMenus", "unlimitedItems", "unlimitedQR", "proLocations", "fullAnalytics", "customDomain"],
  enterprise: ["everythingPro", "unlimitedLocations", "customBranding", "prioritySupport", "dedicatedManager"],
};

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const ta = useTranslations("auth");
  const td = useTranslations("dashboard");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");

  const [data, setData] = useState<OnboardingData>({
    language: "",
    restaurantName: "",
    city: "",
    cuisine: "",
    goals: [],
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Detect current locale on mount
  useEffect(() => {
    const lang = document.documentElement.lang || "ar";
    setData((prev) => ({ ...prev, language: lang }));
  }, []);

  const update = (field: keyof OnboardingData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const toggleGoal = (goal: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleLanguageSwitch = (lang: string) => {
    update("language", lang);
    document.cookie = `locale=${lang};path=/;max-age=31536000`;
    window.location.reload();
  };

  const validateStep = (): boolean => {
    setError("");
    switch (step) {
      case 0: // Language — always valid (pre-selected)
        return true;
      case 1: // Restaurant info
        if (!data.restaurantName.trim()) { setError(t("validation.restaurantNameRequired")); return false; }
        if (!data.city) { setError(t("validation.cityRequired")); return false; }
        if (!data.cuisine) { setError(t("validation.cuisineRequired")); return false; }
        return true;
      case 2: // Goals — skippable
        return true;
      case 3: // Plan recommendation — informational
        return true;
      case 4: // Account
        if (!data.name.trim()) { setError(t("validation.nameRequired")); return false; }
        if (!data.email.trim()) { setError(t("validation.emailRequired")); return false; }
        if (!/\S+@\S+\.\S+/.test(data.email)) { setError(t("validation.emailInvalid")); return false; }
        if (!data.password) { setError(t("validation.passwordRequired")); return false; }
        if (data.password.length < 8) { setError(t("validation.passwordMin")); return false; }
        if (data.password !== data.confirmPassword) { setError(t("validation.passwordMismatch")); return false; }
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (step < STEPS - 1) {
      setSlideDir("left");
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setSlideDir("right");
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    try {
      // 1. Create account
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(
          signupRes.status === 409
            ? ta("errors.emailExists")
            : signupData.error || ta("errors.invalidCredentials")
        );
        setLoading(false);
        return;
      }

      // 2. Auto-login
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Login succeeded but returned error — redirect anyway
        window.location.href = "/dashboard";
        return;
      }

      // 3. Create restaurant with onboarding data
      try {
        await fetch("/api/restaurant", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.restaurantName,
            nameAr: data.language === "ar" ? data.restaurantName : null,
          }),
        });
      } catch {
        // Restaurant creation failure is non-fatal — user can set up later
      }

      // 4. Redirect to dashboard
      window.location.href = "/dashboard";
    } catch {
      setError(ta("errors.invalidCredentials"));
      setLoading(false);
    }
  };

  const stepIcons = [Globe, UtensilsCrossed, Target, CreditCard, UserPlus];
  const recommendedTier = getRecommendedTier(data.goals);
  const TierIcon = TIER_ICONS[recommendedTier];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-indigo-600">
            Menur
          </Link>
          <h2 className="mt-2 text-lg text-gray-600">{t("subtitle")}</h2>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-1">
          {Array.from({ length: STEPS }).map((_, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="flex items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                    i < step
                      ? "bg-indigo-400 text-white"
                      : i === step
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i < step ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                {i < STEPS - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-8 transition-all duration-300 sm:w-12 ${
                      i < step ? "bg-indigo-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Step content */}
            <div
              key={step}
              className="animate-fade-in"
              style={{
                animation: `slideIn${slideDir === "left" ? "Left" : "Right"} 0.25s ease-out`,
              }}
            >
              {/* Step 0: Language */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("language.title")}</h2>
                  <p className="mt-1 text-sm text-gray-500">{t("language.description")}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleLanguageSwitch("ar")}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition ${
                        data.language === "ar"
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-3xl">🇸🇦</span>
                      <span className="text-lg font-semibold text-gray-900">{t("language.arabic")}</span>
                    </button>
                    <button
                      onClick={() => handleLanguageSwitch("en")}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition ${
                        data.language === "en"
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-3xl">🇬🇧</span>
                      <span className="text-lg font-semibold text-gray-900">{t("language.english")}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Restaurant Info */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("restaurant.title")}</h2>
                  <p className="mt-1 text-sm text-gray-500">{t("restaurant.description")}</p>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t("restaurant.name")} *
                      </label>
                      <input
                        type="text"
                        value={data.restaurantName}
                        onChange={(e) => update("restaurantName", e.target.value)}
                        placeholder={t("restaurant.namePlaceholder")}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t("restaurant.city")} *
                      </label>
                      <select
                        value={data.city}
                        onChange={(e) => update("city", e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">{t("restaurant.cityPlaceholder")}</option>
                        {CITY_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {t(`cities.${key}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t("restaurant.cuisine")} *
                      </label>
                      <select
                        value={data.cuisine}
                        onChange={(e) => update("cuisine", e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">{t("restaurant.cuisinePlaceholder")}</option>
                        {CUISINE_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {t(`cuisines.${key}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Goals */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("goals.title")}</h2>
                  <p className="mt-1 text-sm text-gray-500">{t("goals.description")}</p>
                  <div className="mt-6 space-y-3">
                    {GOAL_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleGoal(key)}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-start transition ${
                          data.goals.includes(key)
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                            data.goals.includes(key)
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {data.goals.includes(key) && <Check className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-gray-900">
                          {t(`goals.${key}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Plan Recommendation */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("recommendation.title")}</h2>
                  <p className="mt-1 text-sm text-gray-500">{t("recommendation.description")}</p>

                  <div className="mt-6 rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-6">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${TIER_COLORS[recommendedTier]}`}>
                        <TierIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {t(`recommendation.${recommendedTier}`)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t(`recommendation.${recommendedTier}Desc`)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {TIER_PRICES[recommendedTier]}
                      </span>
                      <span className="text-sm text-gray-500"> {t("recommendation.perMonth")}</span>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">{t("recommendation.included")}</p>
                      <ul className="mt-2 space-y-1.5">
                        {TIER_FEATURES[recommendedTier].map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            {td(`planFeatures.${feat}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs text-gray-400">
                    {t("recommendation.noPaymentNeeded")}
                  </p>

                  <button
                    onClick={() => setShowAllPlans(!showAllPlans)}
                    className="mt-3 w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {t("recommendation.viewAllPlans")}
                  </button>

                  {showAllPlans && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {(["free", "basic", "pro", "enterprise"] as const).map((tier) => {
                        const Icon = TIER_ICONS[tier];
                        return (
                          <div
                            key={tier}
                            className={`rounded-lg border p-3 text-center ${
                              tier === recommendedTier
                                ? "border-indigo-300 bg-indigo-50"
                                : "border-gray-200"
                            }`}
                          >
                            <Icon className={`mx-auto h-5 w-5 ${TIER_COLORS[tier].split(" ")[1]}`} />
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {t(`recommendation.${tier}`)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {TIER_PRICES[tier]} {t("recommendation.perMonth")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Create Account */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("account.title")}</h2>
                  <p className="mt-1 text-sm text-gray-500">{t("account.description")}</p>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{ta("name")} *</label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{ta("email")} *</label>
                      <input
                        type="email"
                        value={data.email}
                        onChange={(e) => update("email", e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{ta("password")} *</label>
                      <input
                        type="password"
                        value={data.password}
                        onChange={(e) => update("password", e.target.value)}
                        required
                        minLength={8}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{ta("confirmPassword")} *</label>
                      <input
                        type="password"
                        value={data.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    {/* Social login */}
                    <div className="relative mt-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500">{ta("orContinueWith")}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {ta("google")}
                      </button>
                      <button
                        onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        {ta("facebook")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 sm:px-8">
            <div>
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("back")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {(step === 2 || step === 3) && (
                <button
                  onClick={goNext}
                  className="text-sm font-medium text-gray-400 transition hover:text-gray-600"
                >
                  {t("skip")}
                </button>
              )}
              {step < STEPS - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    t("createAccount")
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {ta("hasAccount")}{" "}
          <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            {ta("loginButton")}
          </Link>
        </p>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}