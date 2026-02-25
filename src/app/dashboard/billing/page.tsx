"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Crown,
  Check,
  Loader2,
  Zap,
  Building2,
  Star,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Subscription {
  id: string;
  tier: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
  status: string;
  priceAmount: number;
  vatAmount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
}

const PLANS = [
  {
    tier: "FREE" as const,
    icon: Zap,
    color: "bg-gray-50",
    iconColor: "text-gray-600",
    borderActive: "border-gray-300",
    price: 0,
    features: [
      "1 menu",
      "30 menu items",
      "1 QR code",
      "1 location",
      "Light & dark themes",
      "1 language",
    ],
    limits: ["No analytics", "No item photos", "Powered by Menur badge"],
  },
  {
    tier: "BASIC" as const,
    icon: Star,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    borderActive: "border-blue-400",
    price: 34,
    features: [
      "3 menus",
      "100 menu items",
      "3 QR codes",
      "1 location",
      "All themes",
      "2 languages",
      "Basic analytics",
      "Item photos",
    ],
    limits: ["No custom domain"],
  },
  {
    tier: "PRO" as const,
    icon: Crown,
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
    borderActive: "border-indigo-400",
    price: 109,
    popular: true,
    features: [
      "Unlimited menus",
      "Unlimited items",
      "Unlimited QR codes",
      "5 locations",
      "All themes",
      "Unlimited languages",
      "Full analytics",
      "Item photos",
      "Custom domain",
    ],
    limits: [],
  },
  {
    tier: "ENTERPRISE" as const,
    icon: Building2,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    borderActive: "border-purple-400",
    price: 296,
    features: [
      "Everything in Pro",
      "Unlimited locations",
      "Custom branding",
      "Priority support",
      "Dedicated account manager",
    ],
    limits: [],
  },
];

export default function BillingPage() {
  const t = useTranslations("dashboard");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((data) => {
        setSubscription(data.subscription);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Check URL params for payment result
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setMessage("Subscription upgraded successfully!");
      // Refresh subscription data
      fetch("/api/subscriptions")
        .then((r) => r.json())
        .then((data) => setSubscription(data.subscription));
    }
    if (params.get("error")) {
      setError("Payment failed. Please try again.");
    }
  }, []);

  const handleUpgrade = async (tier: string) => {
    if (tier === "FREE") return;
    setUpgrading(tier);
    setError("");

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        // Redirect to Moyasar payment page
        window.location.href = data.paymentUrl;
      } else if (data.mode === "test") {
        // Test mode — instant upgrade
        setSubscription(data.subscription);
        setMessage(`Upgraded to ${tier} (test mode)`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Something went wrong");
      }
    } catch {
      setError("Failed to process upgrade");
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will be downgraded to the Free plan."))
      return;

    try {
      const res = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (res.ok) {
        setMessage("Subscription cancelled. Downgraded to Free plan.");
        // Refresh
        const subRes = await fetch("/api/subscriptions");
        const data = await subRes.json();
        setSubscription(data.subscription);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setError("Failed to cancel subscription");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currentTier = subscription?.tier || "FREE";
  const tierOrder = ["FREE", "BASIC", "PRO", "ENTERPRISE"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        {currentTier !== "FREE" && (
          <button
            onClick={handleCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Current Plan Banner */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Current Plan</h2>
              <p className="text-sm text-gray-500">
                You are on the{" "}
                <span className="font-semibold text-indigo-600">
                  {currentTier}
                </span>{" "}
                plan
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {subscription?.priceAmount
                ? `${(Number(subscription.priceAmount) + Number(subscription.vatAmount)).toFixed(0)} SAR`
                : "0 SAR"}
            </p>
            <p className="text-xs text-gray-400">per month (incl. VAT)</p>
          </div>
        </div>
        {subscription?.currentPeriodEnd && (
          <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400">
            Current period ends:{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Plan Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isUpgrade =
            tierOrder.indexOf(plan.tier) > tierOrder.indexOf(currentTier);
          const isDowngrade =
            tierOrder.indexOf(plan.tier) < tierOrder.indexOf(currentTier);
          const Icon = plan.icon;

          return (
            <div
              key={plan.tier}
              className={`relative rounded-xl border bg-white p-6 transition hover:shadow-md ${
                isCurrent ? plan.borderActive + " border-2" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white">
                    <Sparkles className="h-3 w-3" />
                    POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${plan.color}`}
                >
                  <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.tier}</h3>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500">
                  {plan.price > 0 ? " SAR/mo" : " SAR"}
                </span>
                {plan.price > 0 && (
                  <p className="text-[10px] text-gray-400">
                    incl. 15% VAT
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                {plan.limits.map((l) => (
                  <li
                    key={l}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <span className="mt-0.5 h-3.5 w-3.5 shrink-0 text-center text-[10px]">
                      —
                    </span>
                    {l}
                  </li>
                ))}
              </ul>

              {/* Action */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                {isCurrent ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-500">
                    <Check className="h-4 w-4" />
                    Current Plan
                  </div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.tier)}
                    disabled={upgrading !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {upgrading === plan.tier ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {upgrading === plan.tier ? "Processing..." : "Upgrade"}
                  </button>
                ) : isDowngrade ? (
                  <div className="rounded-lg border border-gray-200 py-2.5 text-center text-sm text-gray-400">
                    Downgrade
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Mode Notice */}
      {!process.env.NEXT_PUBLIC_MOYASAR_KEY && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">Test Mode</span>
          </div>
          <p className="mt-1 text-xs text-amber-600">
            Payments are in test mode. Upgrades will be applied instantly
            without real payment processing.
          </p>
        </div>
      )}
    </div>
  );
}
