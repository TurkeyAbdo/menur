"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Download,
  Trash2,
  QrCode,
  Tag,
  BarChart3,
  Loader2,
  Palette,
} from "lucide-react";
import QRCodeLib from "qrcode";

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

    if (res.ok) {
      const data = await res.json();
      setQrCodes((prev) => [data.qrCode, ...prev]);
      setShowForm(false);
      setLabel("");
      setSelectedMenu("");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this QR code?")) return;
    await fetch(`/api/qr/${id}`, { method: "DELETE" });
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
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
          Generate QR Code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Palette className="h-5 w-5 text-indigo-600" />
            New QR Code
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Menu *
              </label>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose a menu --</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameAr || m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Label (e.g. Table 1)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Optional"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                QR Color
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
                Background Color
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
              Cancel
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
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* QR code list */}
      {qrCodes.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <QrCode className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No QR codes yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate a QR code linked to your menu
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Generate QR Code
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {qrCodes.map((qr) => (
            <QRCard key={qr.id} qr={qr} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function QRCard({
  qr,
  onDelete,
}: {
  qr: QRData;
  onDelete: (id: string) => void;
}) {
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
            <QrCode className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {qr.label || "QR Code"}
            </h3>
            <p className="text-xs text-gray-500">
              {qr.menu?.nameAr || qr.menu?.name || "Unknown menu"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <BarChart3 className="h-3 w-3" />
              {qr._count?.scans || 0} scans
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          Active
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
          onClick={() => onDelete(qr.id)}
          className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
