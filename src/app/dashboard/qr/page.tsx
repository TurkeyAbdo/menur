"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { Plus, Download, Trash2, QrCode } from "lucide-react";
import QRCodeLib from "qrcode";

interface QRData {
  id: string;
  label: string | null;
  config: { fgColor: string; bgColor: string; shape: string };
  menuUrl: string;
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
    await fetch(`/api/qr/${id}`, { method: "DELETE" });
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("qrCodes")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          إنشاء رمز QR
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                اختر القائمة
              </label>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- اختر --</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameAr || m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                التسمية (مثال: طاولة 1)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="اختياري"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                لون الرمز
              </label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                لون الخلفية
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!selectedMenu || saving}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "..." : "إنشاء"}
          </button>
        </div>
      )}

      {/* QR code list */}
      {loading ? (
        <div className="mt-12 text-center text-gray-500">...</div>
      ) : qrCodes.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <QrCode className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            لا توجد رموز QR بعد
          </h3>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        width: 200,
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
    link.href = canvasRef.current.toDataURL(`image/${format === "jpg" ? "jpeg" : "png"}`);
    link.click();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
      <canvas ref={canvasRef} className="mx-auto" />
      {qr.label && (
        <p className="mt-3 font-semibold text-gray-900">{qr.label}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">
        {qr._count?.scans || 0} مسح
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => handleDownload("png")}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          <Download className="h-3 w-3" />
          PNG
        </button>
        <button
          onClick={() => handleDownload("jpg")}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          <Download className="h-3 w-3" />
          JPG
        </button>
        <button
          onClick={() => onDelete(qr.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
