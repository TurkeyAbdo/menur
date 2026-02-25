"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Wifi, Star, Image } from "lucide-react";

const SCENE_DURATION = 3500;
const TOTAL_SCENES = 4;

const themes = [
  {
    name: "Elegant",
    nameAr: "أنيق",
    layout: "cards",
    font: "Amiri",
    bg: "#faf7f2",
    surface: "#ffffff",
    text: "#1a1a1a",
    textSec: "#7a7a7a",
    primary: "#8b6f47",
    accent: "#c5a572",
    price: "#8b6f47",
    border: "#e8e0d4",
    special: "#d4a843",
    hasPhotos: true,
    decoration: "gold-dividers",
  },
  {
    name: "Modern",
    nameAr: "عصري",
    layout: "grid",
    font: "Cairo",
    bg: "#0c1222",
    surface: "#162032",
    text: "#e2e8f0",
    textSec: "#94a3b8",
    primary: "#3b82f6",
    accent: "#22d3ee",
    price: "#22d3ee",
    border: "#334155",
    special: "#eab308",
    hasPhotos: true,
    decoration: "geometric",
  },
  {
    name: "Midnight",
    nameAr: "منتصف الليل",
    layout: "overlay",
    font: "Noto Kufi Arabic",
    bg: "#09090b",
    surface: "#18181b",
    text: "#fafafa",
    textSec: "#a1a1aa",
    primary: "#f59e0b",
    accent: "#fbbf24",
    price: "#f59e0b",
    border: "#27272a",
    special: "#fbbf24",
    hasPhotos: true,
    decoration: "stars",
  },
  {
    name: "Ocean",
    nameAr: "محيط",
    layout: "magazine",
    font: "Changa",
    bg: "#042f2e",
    surface: "#0d3d3b",
    text: "#f0fdfa",
    textSec: "#99c7c1",
    primary: "#14b8a6",
    accent: "#fb923c",
    price: "#14b8a6",
    border: "#1a4d4a",
    special: "#fb923c",
    hasPhotos: true,
    decoration: "waves",
  },
];

const menuItems = [
  { name: "قهوة عربية", desc: "مع الهيل والزعفران", price: "15", special: true },
  { name: "كباب لحم", desc: "لحم غنم طازج مشوي", price: "45", special: false },
  { name: "سلطة فتوش", desc: "خضار طازجة مع دبس الرمان", price: "22", special: false },
  { name: "عصير برتقال", desc: "طازج ومنعش", price: "12", special: false },
];

const stats = [
  { label: "المسح اليوم", value: "1,247", change: "+23%", color: "#6366f1" },
  { label: "القوائم النشطة", value: "8", change: "+2", color: "#10b981" },
  { label: "الأصناف", value: "156", change: "+12", color: "#f59e0b" },
];

const sceneVariants = {
  enter: { opacity: 0, y: 20, scale: 0.97 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -15, scale: 0.97 },
};

const LAYOUT_LABELS: Record<string, string> = {
  cards: "بطاقات",
  grid: "شبكة",
  overlay: "غطاء",
  magazine: "مجلة",
};

/* ─── Scene 0: QR Scan ─── */
function QRScene() {
  return (
    <div className="flex h-full flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
      >
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="grid grid-cols-5 grid-rows-5 gap-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-8 w-8 rounded"
                style={{
                  backgroundColor: [0,1,2,5,6,10,12,14,18,19,20,21,22,23,24,4,3,9,15].includes(i) ? "#6366f1" : "#e5e7eb",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.02, duration: 0.2 }}
              />
            ))}
          </div>
          <motion.p
            className="mt-5 text-center text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            menur.app/m/cafe-riyadh
          </motion.p>
        </div>

        <motion.div
          className="absolute inset-x-0 h-0.5 bg-white/40"
          initial={{ top: "10%" }}
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        className="mt-8 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Wifi className="h-4 w-4 text-white/60" />
        <span className="text-sm text-white/70">جاري فتح القائمة...</span>
      </motion.div>
    </div>
  );
}

/* ─── Layout-specific item renderers for Menu Scene ─── */
function CardsItem({ item, t }: { item: typeof menuItems[0]; t: typeof themes[0] }) {
  return (
    <motion.div
      className="flex gap-2.5 rounded-lg p-2.5"
      animate={{ backgroundColor: t.surface, boxShadow: `0 1px 8px ${t.border}50` }}
      transition={{ duration: 0.5 }}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      {/* Photo placeholder */}
      <motion.div
        className="h-12 w-12 shrink-0 rounded-lg flex items-center justify-center"
        animate={{ backgroundColor: t.primary + "18" }}
        transition={{ duration: 0.5 }}
      >
        <Image className="h-4 w-4" style={{ color: t.primary + "50" }} />
      </motion.div>
      <div className="min-w-0 flex-1" dir="rtl">
        <div className="flex items-center gap-1.5">
          <motion.span className="text-[10px] font-semibold" animate={{ color: t.text }} transition={{ duration: 0.5 }}>
            {item.name}
          </motion.span>
          {item.special && (
            <motion.span
              className="flex items-center gap-0.5 rounded-full px-1 py-px text-[7px] font-bold"
              animate={{ backgroundColor: t.special + "20", color: t.special }}
              transition={{ duration: 0.5 }}
            >
              <Star className="h-1.5 w-1.5" /> مميز
            </motion.span>
          )}
        </div>
        <motion.p className="mt-0.5 text-[8px]" animate={{ color: t.textSec }} transition={{ duration: 0.5 }}>
          {item.desc}
        </motion.p>
        <motion.span className="mt-0.5 inline-block text-[10px] font-bold" animate={{ color: t.price }} transition={{ duration: 0.5 }}>
          {item.price} SAR
        </motion.span>
      </div>
    </motion.div>
  );
}

function GridItem({ item, t }: { item: typeof menuItems[0]; t: typeof themes[0] }) {
  return (
    <motion.div
      className="overflow-hidden rounded-lg"
      animate={{ borderColor: t.border }}
      transition={{ duration: 0.5 }}
      style={{ border: "1px solid" }}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <motion.div className="h-14 flex items-center justify-center" animate={{ backgroundColor: t.primary + "12" }} transition={{ duration: 0.5 }}>
        <Image className="h-4 w-4" style={{ color: t.primary + "30" }} />
      </motion.div>
      <motion.div className="p-2" animate={{ backgroundColor: t.surface }} transition={{ duration: 0.5 }} dir="rtl">
        <motion.span className="text-[9px] font-semibold" animate={{ color: t.text }} transition={{ duration: 0.5 }}>
          {item.name}
        </motion.span>
        <motion.p className="mt-0.5 text-[7px]" animate={{ color: t.textSec }} transition={{ duration: 0.5 }}>
          {item.desc}
        </motion.p>
        <motion.span className="mt-0.5 inline-block text-[9px] font-bold" animate={{ color: t.price }} transition={{ duration: 0.5 }}>
          {item.price} SAR
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function OverlayItem({ item, t }: { item: typeof menuItems[0]; t: typeof themes[0] }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg"
      style={{ height: "56px" }}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <motion.div className="absolute inset-0" animate={{ backgroundColor: t.primary + "20" }} transition={{ duration: 0.5 }} />
      <motion.div
        className="absolute inset-0"
        animate={{ background: `linear-gradient(to top, ${t.bg}ee, transparent)` }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute inset-x-0 bottom-0 p-2" dir="rtl">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1">
              <motion.span className="text-[10px] font-bold" animate={{ color: t.text }} transition={{ duration: 0.5 }}>
                {item.name}
              </motion.span>
              {item.special && (
                <motion.span className="text-[7px]" animate={{ color: t.special }} transition={{ duration: 0.5 }}>
                  <Star className="inline h-2 w-2" />
                </motion.span>
              )}
            </div>
            <motion.p className="text-[7px]" animate={{ color: t.textSec }} transition={{ duration: 0.5 }}>{item.desc}</motion.p>
          </div>
          <motion.span className="text-[10px] font-bold" animate={{ color: t.price }} transition={{ duration: 0.5 }}>
            {item.price} SAR
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

function MagazineItems({ items, t }: { items: typeof menuItems; t: typeof themes[0] }) {
  return (
    <div className="space-y-2" dir="rtl">
      {/* Featured */}
      <motion.div
        className="overflow-hidden rounded-lg"
        animate={{ backgroundColor: t.surface }}
        transition={{ duration: 0.5 }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.div className="h-16 flex items-center justify-center" animate={{ backgroundColor: t.primary + "12" }} transition={{ duration: 0.5 }}>
          <Image className="h-5 w-5" style={{ color: t.primary + "30" }} />
        </motion.div>
        <div className="p-2">
          <div className="flex items-center gap-1">
            <motion.span className="text-[11px] font-bold" animate={{ color: t.text }} transition={{ duration: 0.5 }}>{items[0].name}</motion.span>
            <motion.span className="rounded-full px-1 py-px text-[7px] font-bold" animate={{ backgroundColor: t.special + "20", color: t.special }} transition={{ duration: 0.5 }}>مميز</motion.span>
          </div>
          <motion.p className="mt-0.5 text-[8px]" animate={{ color: t.textSec }} transition={{ duration: 0.5 }}>{items[0].desc}</motion.p>
          <motion.span className="mt-0.5 inline-block text-[10px] font-bold" animate={{ color: t.price }} transition={{ duration: 0.5 }}>{items[0].price} SAR</motion.span>
        </div>
      </motion.div>
      {/* Small items */}
      {items.slice(1, 3).map((item) => (
        <motion.div
          key={item.name}
          className="flex gap-2 rounded-md p-2"
          animate={{ backgroundColor: t.surface }}
          transition={{ duration: 0.5 }}
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <motion.div className="h-8 w-8 shrink-0 rounded flex items-center justify-center" animate={{ backgroundColor: t.primary + "15" }} transition={{ duration: 0.5 }}>
            <Image className="h-3 w-3" style={{ color: t.primary + "30" }} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <motion.span className="text-[9px] font-semibold" animate={{ color: t.text }} transition={{ duration: 0.5 }}>{item.name}</motion.span>
            <motion.span className="ms-2 text-[9px] font-bold" animate={{ color: t.price }} transition={{ duration: 0.5 }}>{item.price} SAR</motion.span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Scene 1: Menu Browsing (layout-aware) ─── */
function MenuScene() {
  const [themeIdx, setThemeIdx] = useState(0);
  const t = themes[themeIdx];

  useEffect(() => {
    const interval = setInterval(() => {
      setThemeIdx((prev) => (prev + 1) % themes.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex h-full flex-col overflow-hidden"
      animate={{ backgroundColor: t.bg }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div className="px-6 pt-5 pb-2" animate={{ backgroundColor: t.bg }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between" dir="rtl">
          <div>
            <motion.p className="text-sm font-semibold" animate={{ color: t.text }} transition={{ duration: 0.5 }}>
              مقهى الرياض
            </motion.p>
            <motion.p className="mt-0.5 text-[10px]" animate={{ color: t.textSec }} transition={{ duration: 0.5 }}>
              المشروبات والمأكولات
            </motion.p>
          </div>
          <motion.div
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            animate={{ backgroundColor: t.primary + "15" }}
            transition={{ duration: 0.5 }}
          >
            <motion.span className="text-[8px] font-bold" animate={{ color: t.primary }} transition={{ duration: 0.5 }}>
              {LAYOUT_LABELS[t.layout]}
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <div className="flex gap-2 px-6 pb-2" dir="rtl">
        {["المشروبات", "الرئيسية"].map((cat, i) => (
          <motion.span
            key={cat}
            className="rounded-full px-2.5 py-0.5 text-[9px] font-medium"
            animate={{
              backgroundColor: i === 0 ? t.primary : "transparent",
              color: i === 0 ? "#ffffff" : t.textSec,
              borderColor: i === 0 ? t.primary : t.border,
            }}
            transition={{ duration: 0.5 }}
            style={{ border: "1px solid" }}
          >
            {cat}
          </motion.span>
        ))}
      </div>

      {/* Items — layout changes per theme */}
      <div className="flex-1 overflow-hidden px-6 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={t.layout}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {t.layout === "cards" && (
              <div className="space-y-2">
                {menuItems.slice(0, 3).map((item) => (
                  <CardsItem key={item.name} item={item} t={t} />
                ))}
              </div>
            )}
            {t.layout === "grid" && (
              <div className="grid grid-cols-2 gap-2">
                {menuItems.slice(0, 4).map((item) => (
                  <GridItem key={item.name} item={item} t={t} />
                ))}
              </div>
            )}
            {t.layout === "overlay" && (
              <div className="space-y-2">
                {menuItems.slice(0, 3).map((item) => (
                  <OverlayItem key={item.name} item={item} t={t} />
                ))}
              </div>
            )}
            {t.layout === "magazine" && (
              <MagazineItems items={menuItems} t={t} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Theme + Font indicator */}
      <motion.div
        className="flex items-center justify-center gap-3 pb-3"
        animate={{ color: t.primary }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[7px] font-semibold uppercase tracking-[0.15em] opacity-40">
          {t.name}
        </span>
        <span className="text-[7px] opacity-25">|</span>
        <span className="text-[7px] opacity-30">
          {t.font}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ─── Scene 2: Theme Showcase (layout-aware) ─── */
function ThemeShowcase() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-gray-50 to-gray-100 px-8">
      <motion.p
        className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        8 ثيمات مميزة
      </motion.p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {themes.map((t, i) => (
          <motion.div
            key={t.name}
            className="overflow-hidden rounded-xl"
            style={{ border: `1px solid ${t.border}` }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 200 }}
          >
            <div className="p-2.5" style={{ backgroundColor: t.bg }}>
              {/* Mini layout preview per theme */}
              {t.layout === "cards" && (
                <div className="space-y-1">
                  {[1, 2].map((n) => (
                    <div key={n} className="flex gap-1 rounded p-1" style={{ backgroundColor: t.surface }}>
                      <div className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: t.primary + "18" }} />
                      <div className="flex-1">
                        <div className="h-1 w-8 rounded-full" style={{ backgroundColor: t.text, opacity: 0.5 }} />
                        <div className="mt-0.5 h-0.5 w-5 rounded-full" style={{ backgroundColor: t.price, opacity: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {t.layout === "grid" && (
                <div className="grid grid-cols-2 gap-1">
                  {[1, 2].map((n) => (
                    <div key={n} className="rounded overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
                      <div className="h-4" style={{ backgroundColor: t.primary + "12" }} />
                      <div className="p-0.5" style={{ backgroundColor: t.surface }}>
                        <div className="h-1 w-6 rounded-full" style={{ backgroundColor: t.text, opacity: 0.5 }} />
                        <div className="mt-0.5 h-0.5 w-4 rounded-full" style={{ backgroundColor: t.price, opacity: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {t.layout === "overlay" && (
                <div className="space-y-1">
                  {[1, 2].map((n) => (
                    <div key={n} className="relative rounded overflow-hidden" style={{ height: "18px" }}>
                      <div className="absolute inset-0" style={{ backgroundColor: t.primary + "20" }} />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.bg}dd, transparent)` }} />
                      <div className="absolute inset-x-0 bottom-0 p-0.5">
                        <div className="h-1 w-8 rounded-full" style={{ backgroundColor: t.text, opacity: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {t.layout === "magazine" && (
                <div className="space-y-1">
                  <div className="rounded overflow-hidden" style={{ backgroundColor: t.surface }}>
                    <div className="h-5" style={{ backgroundColor: t.primary + "12" }} />
                    <div className="p-0.5">
                      <div className="h-1 w-10 rounded-full" style={{ backgroundColor: t.text, opacity: 0.5 }} />
                      <div className="mt-0.5 h-0.5 w-5 rounded-full" style={{ backgroundColor: t.price, opacity: 0.6 }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between bg-white/60 px-2 py-1">
              <p className="text-[7px] font-medium text-gray-500">{t.nameAr}</p>
              <span className="rounded bg-gray-100 px-1 py-px text-[6px] text-gray-400">
                {LAYOUT_LABELS[t.layout]}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {themes.map((t, i) => (
          <motion.div
            key={t.primary}
            className="flex flex-col items-center gap-0.5"
          >
            <motion.div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: t.primary }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
            <span className="text-[5px] text-gray-400">{t.font}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Scene 3: Analytics ─── */
function AnalyticsScene() {
  const bars = [40, 65, 45, 80, 55, 90, 70];

  return (
    <div className="flex h-full flex-col bg-[#0f172a] px-6 pt-6 pb-5">
      <p className="text-[11px] font-semibold text-slate-400" dir="rtl">لوحة التحكم</p>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-lg bg-[#1e293b] p-2.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
          >
            <p className="text-[7px] text-slate-500" dir="rtl">{s.label}</p>
            <p className="mt-0.5 text-sm font-bold text-white">{s.value}</p>
            <p className="text-[7px] font-semibold" style={{ color: s.color }}>{s.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-4 flex-1 rounded-lg bg-[#1e293b] p-4">
        <p className="text-[7px] text-slate-500 mb-3" dir="rtl">عمليات المسح (أسبوع)</p>
        <div className="flex h-full items-end gap-2.5 pb-4">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t"
              style={{ backgroundColor: i === bars.length - 1 ? "#10b981" : "#6366f1" }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>

      {/* QR scans ticker */}
      <motion.div
        className="mt-3 flex items-center justify-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <QrCode className="h-2.5 w-2.5 text-indigo-400/50" />
        <span className="text-[8px] text-slate-500">+3 مسح الآن</span>
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

/* ─── Main Exported Component ─── */
export default function HeroAnimation() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScene((prev) => (prev + 1) % TOTAL_SCENES);
    }, SCENE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const scenes = [QRScene, MenuScene, ThemeShowcase, AnalyticsScene];
  const ActiveScene = scenes[scene];

  return (
    <div className="mx-auto w-full">
      {/* Screen frame */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-2xl shadow-indigo-200/30">
        {/* Screen */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
          {/* Scene content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              className="absolute inset-0"
              variants={sceneVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <ActiveScene />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Scene indicators */}
      <div className="mt-5 flex items-center justify-center gap-3">
        {["QR", "القائمة", "الثيمات", "التحليلات"].map((label, i) => (
          <button
            key={label}
            onClick={() => setScene(i)}
            className="flex flex-col items-center gap-1"
          >
            <motion.div
              className="h-1.5 rounded-full"
              animate={{
                width: scene === i ? 24 : 8,
                backgroundColor: scene === i ? "#6366f1" : "#d1d5db",
              }}
              transition={{ duration: 0.3 }}
            />
            <span
              className={`text-[9px] font-medium transition-colors ${
                scene === i ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
