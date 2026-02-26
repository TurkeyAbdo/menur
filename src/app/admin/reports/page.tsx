"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslations } from "next-intl";
import {
  FileDown,
  FileText,
  ImageIcon,
  BarChart3,
  Store,
  CreditCard,
  MessageSquare,
  Loader2,
} from "lucide-react";
import ReportRenderer, {
  type ReportStat,
  type ReportChart,
} from "@/components/ReportRenderer";
import { exportAsPdf, exportAsImage } from "@/lib/export-report";

type DatePreset = "today" | "7d" | "30d" | "90d" | "all";

function getDateRange(preset: DatePreset): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];

  if (preset === "all") return { from: "", to: "" };

  const fromDate = new Date(now);
  if (preset === "today") {
    // from is already today
  } else if (preset === "7d") {
    fromDate.setDate(fromDate.getDate() - 7);
  } else if (preset === "30d") {
    fromDate.setDate(fromDate.getDate() - 30);
  } else if (preset === "90d") {
    fromDate.setDate(fromDate.getDate() - 90);
  }

  return { from: fromDate.toISOString().split("T")[0], to };
}

function buildBreakdownCharts(
  breakdown: Record<string, number>,
  total: number
): ReportChart[] {
  return Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

export default function AdminReportsPage() {
  const t = useTranslations("admin.reports");
  const td = useTranslations("dashboard");
  const [activePreset, setActivePreset] = useState<DatePreset>("30d");
  const [downloading, setDownloading] = useState<string | null>(null);

  const presets: { key: DatePreset; label: string }[] = [
    { key: "today", label: td("today") },
    { key: "7d", label: td("last7Days") },
    { key: "30d", label: td("last30Days") },
    { key: "90d", label: td("last90Days") },
    { key: "all", label: td("allTime") },
  ];

  const reports = [
    {
      type: "scans",
      title: t("scansReport"),
      description: t("scansReportDesc"),
      icon: BarChart3,
    },
    {
      type: "restaurants",
      title: t("restaurantsReport"),
      description: t("restaurantsReportDesc"),
      icon: Store,
    },
    {
      type: "subscriptions",
      title: t("subscriptionsReport"),
      description: t("subscriptionsReportDesc"),
      icon: CreditCard,
    },
    {
      type: "feedback",
      title: t("feedbackReport"),
      description: t("feedbackReportDesc"),
      icon: MessageSquare,
    },
  ];

  const downloadCsv = async (type: string) => {
    setDownloading(`${type}-csv`);
    try {
      const { from, to } = getDateRange(activePreset);
      const params = new URLSearchParams({ type });
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error("Download failed");

      const csv = await res.text();
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Download failed silently
    } finally {
      setDownloading(null);
    }
  };

  const downloadReport = async (
    type: string,
    exportType: "pdf" | "image"
  ) => {
    setDownloading(`${type}-${exportType}`);
    let container: HTMLDivElement | null = null;
    let root: ReturnType<typeof createRoot> | null = null;

    try {
      const { from, to } = getDateRange(activePreset);
      const params = new URLSearchParams({ type, format: "json" });
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error("Download failed");

      const data = await res.json();
      const summary = data.summary || {};

      const reportTitle =
        reports.find((r) => r.type === type)?.title || "Report";
      const dateRangeStr =
        from && to ? `${from} — ${to}` : td("allTime");

      let stats: ReportStat[] = [];
      let charts: ReportChart[] | undefined;
      let chartTitle: string | undefined;

      if (type === "scans") {
        stats = [
          { label: td("totalScans"), value: summary.total ?? 0 },
          { label: "Unique Cities", value: summary.uniqueCities ?? 0 },
          { label: "Top Country", value: summary.topCountry ?? "N/A" },
        ];
        if (summary.deviceBreakdown) {
          chartTitle = td("deviceBreakdown");
          charts = buildBreakdownCharts(
            summary.deviceBreakdown,
            summary.total
          );
        }
      } else if (type === "restaurants") {
        stats = [
          { label: "Total Restaurants", value: summary.total ?? 0 },
        ];
      } else if (type === "subscriptions") {
        stats = [
          { label: "Total Subscriptions", value: summary.total ?? 0 },
          {
            label: "Total Revenue (SAR)",
            value: summary.totalRevenue ?? 0,
          },
          {
            label: "Active",
            value: summary.statusBreakdown?.ACTIVE ?? 0,
          },
        ];
        if (summary.tierBreakdown) {
          chartTitle = "Tier Breakdown";
          charts = buildBreakdownCharts(
            summary.tierBreakdown,
            summary.total
          );
        }
      } else if (type === "feedback") {
        stats = [
          { label: "Total Reviews", value: summary.total ?? 0 },
          { label: "Average Rating", value: summary.averageRating ?? 0 },
        ];
        if (summary.ratingDistribution) {
          chartTitle = "Rating Distribution";
          charts = Object.entries(
            summary.ratingDistribution as Record<string, number>
          )
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([star, count]) => ({
              label: `${star} Star`,
              value: count,
              percent:
                summary.total > 0
                  ? Math.round((count / summary.total) * 100)
                  : 0,
            }));
        }
      }

      // Create off-screen container and render imperatively
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      document.body.appendChild(container);

      let captureElement: HTMLDivElement | null = null;

      root = createRoot(container);
      root.render(
        <ReportRenderer
          ref={(el) => {
            captureElement = el;
          }}
          title={reportTitle}
          dateRange={dateRangeStr}
          stats={stats}
          charts={charts}
          chartTitle={chartTitle}
          headers={data.headers}
          rows={data.rows}
        />
      );

      // Wait for React to commit and browser to paint
      await waitForPaint();
      await new Promise((r) => setTimeout(r, 100));

      if (!captureElement) {
        throw new Error("Report element not rendered");
      }

      const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

      if (exportType === "pdf") {
        await exportAsPdf(captureElement, filename);
      } else {
        await exportAsImage(captureElement, filename);
      }
    } catch {
      // Export failed silently
    } finally {
      // Cleanup
      if (root) root.unmount();
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setDownloading(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-700">
          {td("dateRange")}
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.key}
              onClick={() => setActivePreset(preset.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activePreset === preset.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.type}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-indigo-50 p-2.5">
                  <report.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* CSV */}
                <button
                  onClick={() => downloadCsv(report.type)}
                  disabled={downloading !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
                >
                  {downloading === `${report.type}-csv` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  CSV
                </button>
                {/* PDF */}
                <button
                  onClick={() => downloadReport(report.type, "pdf")}
                  disabled={downloading !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
                >
                  {downloading === `${report.type}-pdf` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {t("downloadPdf")}
                </button>
                {/* Image */}
                <button
                  onClick={() => downloadReport(report.type, "image")}
                  disabled={downloading !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
                >
                  {downloading === `${report.type}-image` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {t("downloadImage")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
