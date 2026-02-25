"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Download,
  Trash2,
  QrCode,
  BarChart3,
  Loader2,
  Palette,
  Printer,
} from "lucide-react";
import QRCodeLib from "qrcode";
import { useToast } from "@/components/Toast";

interface QRData {
  id: string;
  label: string | null;
  config: { fgColor: string; bgColor: string; shape: string };
  menuUrl: string;
  menu: { name: string; nameAr: string | null };
  _count: { scans: number };
}

interface MenuOption {
  id: string;
  name: string;
  nameAr: string | null;
}

export default function QRPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState<QRData[]>([]);
  const [menus, setMenus] = useState<MenuOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [selectedMenu, setSelectedMenu] = useState("");
  const [label, setLabel] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/qr").then((r) => r.json()),
      fetch("/api/menus").then((r) => r.json()),
    ]).then(([qrData, menuData]) => {
      setQrCodes(qrData.qrCodes || []);
      setMenus(menuData.menus || []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!selectedMenu) return;
    setSaving(true);

    const res = await fetch("/api/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menuId: selectedMenu,
        label: label || null,
        config: { fgColor, bgColor, shape: "square" },
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setQrCodes((prev) => [data.qrCode, ...prev]);
      setShowForm(false);
      setLabel("");
      setSelectedMenu("");
      toast("success", t("qrCreated"));
    } else {
      toast("error", data.error || t("qrCreateFailed"));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteQRConfirm"))) return;
    await fetch(`/api/qr/${id}`, { method: "DELETE" });
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
    toast("success", t("qrDeleted"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("qrCodes")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          {t("generateQR")}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Palette className="h-5 w-5 text-indigo-600" />
            {t("newQRCode")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("selectMenu")} *
              </label>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">{t("chooseMenu")}</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isAr ? (m.nameAr || m.name) : m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("qrLabel")}
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={tc("optional")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("qrColor")}
              </label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("bgColor")}
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-gray-300"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {tc("cancel")}
            </button>
            <button
              onClick={handleCreate}
              disabled={!selectedMenu || saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {saving ? t("creating") : tc("create")}
            </button>
          </div>
        </div>
      )}

      {/* QR code list */}
      {qrCodes.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <QrCode className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {t("noQRCodes")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("qrHint")}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            {t("generateQR")}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {qrCodes.map((qr) => (
            <QRCard key={qr.id} qr={qr} onDelete={handleDelete} isAr={isAr} />
          ))}
        </div>
      )}
    </div>
  );
}

function QRCard({
  qr,
  onDelete,
  isAr,
}: {
  qr: QRData;
  onDelete: (id: string) => void;
  isAr: boolean;
}) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, qr.menuUrl, {
        width: 180,
        margin: 2,
        color: {
          dark: qr.config?.fgColor || "#000000",
          light: qr.config?.bgColor || "#ffffff",
        },
      });
    }
  }, [qr]);

  const handleDownload = (format: string) => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${qr.label || qr.id}.${format}`;
    link.href = canvasRef.current.toDataURL(
      `image/${format === "jpg" ? "jpeg" : "png"}`
    );
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const qrDataUrl = canvas.toDataURL("image/png");
    const menuName = isAr ? (qr.menu?.nameAr || qr.menu?.name) : (qr.menu?.name || "Menu");
    const labelText = qr.label || "";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isAr ? "rtl" : "ltr"}">
      <head>
        <title>${t("printTableCard")}</title>
        <style>
          @page { size: 100mm 140mm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: white;
          }
          .card {
            width: 100mm;
            padding: 12mm 8mm;
            text-align: center;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 4mm;
          }
          .qr-img {
            width: 60mm;
            height: 60mm;
            margin: 4mm auto;
          }
          .label {
            font-size: 22px;
            font-weight: bold;
            color: #4f46e5;
            margin-top: 4mm;
          }
          .scan-text {
            font-size: 12px;
            color: #6b7280;
            margin-top: 3mm;
          }
          .branding {
            font-size: 9px;
            color: #9ca3af;
            margin-top: 4mm;
          }
          @media print {
            body { min-height: auto; }
            .card { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="restaurant-name">${menuName}</div>
          <img class="qr-img" src="${qrDataUrl}" alt="QR Code" />
          ${labelText ? `<div class="label">${labelText}</div>` : ""}
          <div class="scan-text">${isAr ? "\u0627\u0645\u0633\u062D \u0631\u0645\u0632 QR \u0644\u0639\u0631\u0636 \u0627\u0644\u0642\u0627\u0626\u0645\u0629" : "Scan QR code to view menu"}</div>
          <div class="branding">Powered by Menur</div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
            <QrCode className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {qr.label || t("qrCodes")}
            </h3>
            <p className="text-xs text-gray-500">
              {isAr
                ? (qr.menu?.nameAr || qr.menu?.name || t("unknownMenu"))
                : (qr.menu?.name || t("unknownMenu"))}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <BarChart3 className="h-3 w-3" />
              {qr._count?.scans || 0} {t("scans")}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          {tc("active")}
        </span>
      </div>

      {/* QR Preview */}
      <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
        <canvas
          ref={canvasRef}
          className="rounded-lg border border-gray-100"
        />
      </div>

      {/* Action bar */}
      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={() => handleDownload("png")}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5" />
          PNG
        </button>
        <button
          onClick={() => handleDownload("jpg")}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5" />
          JPG
        </button>
        <button
          onClick={handlePrint}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Printer className="h-3.5 w-3.5" />
          {t("printTableCard")}
        </button>
        <button
          onClick={() => onDelete(qr.id)}
          className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}