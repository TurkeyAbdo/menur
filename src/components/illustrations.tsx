"use client";

import { motion } from "framer-motion";

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Browser frame */}
      <rect x="0" y="0" width="800" height="500" rx="12" fill="#1e1e2e" />
      <rect x="0" y="0" width="800" height="40" rx="12" fill="#2a2a3e" />
      <circle cx="20" cy="20" r="6" fill="#ff5f57" />
      <circle cx="40" cy="20" r="6" fill="#febc2e" />
      <circle cx="60" cy="20" r="6" fill="#28c840" />
      <rect x="200" y="12" width="400" height="16" rx="8" fill="#1e1e2e" />

      {/* Sidebar */}
      <rect x="0" y="40" width="180" height="460" fill="#252538" />
      <rect x="16" y="60" width="100" height="12" rx="4" fill="#6366f1" opacity="0.8" />
      <rect x="16" y="92" width="148" height="10" rx="4" fill="#3a3a52" />
      <rect x="16" y="114" width="148" height="10" rx="4" fill="#3a3a52" />
      <rect x="16" y="136" width="148" height="10" rx="4" fill="#6366f1" opacity="0.3" />
      <rect x="16" y="158" width="148" height="10" rx="4" fill="#3a3a52" />
      <rect x="16" y="180" width="148" height="10" rx="4" fill="#3a3a52" />

      {/* Stat cards */}
      <rect x="200" y="60" width="180" height="90" rx="10" fill="#2a2a3e" />
      <rect x="216" y="76" width="60" height="8" rx="3" fill="#6366f1" opacity="0.5" />
      <rect x="216" y="96" width="80" height="20" rx="4" fill="#e0e0ff" opacity="0.9" />
      <rect x="216" y="126" width="40" height="8" rx="3" fill="#10b981" opacity="0.6" />

      <rect x="400" y="60" width="180" height="90" rx="10" fill="#2a2a3e" />
      <rect x="416" y="76" width="60" height="8" rx="3" fill="#10b981" opacity="0.5" />
      <rect x="416" y="96" width="80" height="20" rx="4" fill="#e0e0ff" opacity="0.9" />
      <rect x="416" y="126" width="40" height="8" rx="3" fill="#6366f1" opacity="0.6" />

      <rect x="600" y="60" width="180" height="90" rx="10" fill="#2a2a3e" />
      <rect x="616" y="76" width="60" height="8" rx="3" fill="#f59e0b" opacity="0.5" />
      <rect x="616" y="96" width="80" height="20" rx="4" fill="#e0e0ff" opacity="0.9" />
      <rect x="616" y="126" width="40" height="8" rx="3" fill="#10b981" opacity="0.6" />

      {/* Bar chart */}
      <rect x="200" y="170" width="370" height="200" rx="10" fill="#2a2a3e" />
      <rect x="230" y="310" width="30" height="40" rx="4" fill="#6366f1" opacity="0.7" />
      <rect x="275" y="280" width="30" height="70" rx="4" fill="#6366f1" opacity="0.8" />
      <rect x="320" y="250" width="30" height="100" rx="4" fill="#6366f1" />
      <rect x="365" y="270" width="30" height="80" rx="4" fill="#6366f1" opacity="0.8" />
      <rect x="410" y="230" width="30" height="120" rx="4" fill="#6366f1" />
      <rect x="455" y="260" width="30" height="90" rx="4" fill="#6366f1" opacity="0.9" />
      <rect x="500" y="220" width="30" height="130" rx="4" fill="#10b981" />

      {/* QR code preview */}
      <rect x="590" y="170" width="190" height="200" rx="10" fill="#2a2a3e" />
      <rect x="620" y="195" width="130" height="130" rx="8" fill="#ffffff" opacity="0.1" />
      {/* QR grid pattern */}
      <rect x="630" y="205" width="20" height="20" rx="2" fill="#6366f1" opacity="0.8" />
      <rect x="655" y="205" width="20" height="20" rx="2" fill="#6366f1" opacity="0.6" />
      <rect x="680" y="205" width="20" height="20" rx="2" fill="#6366f1" opacity="0.8" />
      <rect x="705" y="205" width="20" height="20" rx="2" fill="#6366f1" opacity="0.4" />
      <rect x="730" y="205" width="10" height="20" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="630" y="230" width="20" height="20" rx="2" fill="#6366f1" opacity="0.4" />
      <rect x="655" y="230" width="20" height="20" rx="2" fill="#6366f1" opacity="0.8" />
      <rect x="680" y="230" width="20" height="20" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="705" y="230" width="20" height="20" rx="2" fill="#6366f1" opacity="0.9" />
      <rect x="630" y="255" width="20" height="20" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="655" y="255" width="20" height="20" rx="2" fill="#6366f1" opacity="0.3" />
      <rect x="680" y="255" width="20" height="20" rx="2" fill="#6366f1" opacity="0.8" />
      <rect x="705" y="255" width="20" height="20" rx="2" fill="#6366f1" opacity="0.6" />
      <rect x="630" y="280" width="20" height="20" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="655" y="280" width="20" height="20" rx="2" fill="#6366f1" opacity="0.9" />
      <rect x="680" y="280" width="20" height="20" rx="2" fill="#6366f1" opacity="0.4" />
      <rect x="705" y="280" width="20" height="20" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="630" y="305" width="20" height="20" rx="2" fill="#6366f1" opacity="0.8" />
      <rect x="655" y="305" width="20" height="20" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="680" y="305" width="20" height="20" rx="2" fill="#6366f1" opacity="0.9" />
      <rect x="705" y="305" width="20" height="20" rx="2" fill="#6366f1" opacity="0.3" />
      <rect x="620" y="340" width="130" height="8" rx="3" fill="#6366f1" opacity="0.4" />

      {/* Bottom row */}
      <rect x="200" y="390" width="370" height="90" rx="10" fill="#2a2a3e" />
      <rect x="216" y="406" width="80" height="10" rx="3" fill="#e0e0ff" opacity="0.5" />
      <rect x="216" y="426" width="338" height="6" rx="3" fill="#3a3a52" />
      <rect x="216" y="442" width="280" height="6" rx="3" fill="#3a3a52" />
      <rect x="216" y="458" width="200" height="6" rx="3" fill="#3a3a52" />

      <rect x="590" y="390" width="190" height="90" rx="10" fill="#2a2a3e" />
      <rect x="606" y="406" width="80" height="10" rx="3" fill="#10b981" opacity="0.5" />
      <rect x="606" y="426" width="158" height="6" rx="3" fill="#3a3a52" />
      <rect x="606" y="442" width="120" height="6" rx="3" fill="#3a3a52" />
    </svg>
  );
}

export function FloatingElements() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
      {/* Top-right rounded square */}
      <motion.div
        className="absolute -top-4 right-[10%] h-20 w-20 rounded-2xl bg-indigo-200/30"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Top-left circle */}
      <motion.div
        className="absolute top-20 left-[5%] h-14 w-14 rounded-full bg-emerald-200/30"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      {/* Mid-right small circle */}
      <motion.div
        className="absolute top-1/3 right-[8%] h-10 w-10 rounded-full bg-amber-200/30"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Bottom-left rounded square */}
      <motion.div
        className="absolute bottom-1/4 left-[12%] h-16 w-16 rounded-xl bg-indigo-200/20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      {/* Bottom-right small square */}
      <motion.div
        className="absolute right-[15%] bottom-1/3 h-8 w-8 rounded-lg bg-emerald-200/25"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      {/* Mid-left tiny circle */}
      <motion.div
        className="absolute top-1/2 left-[3%] h-6 w-6 rounded-full bg-purple-200/25"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
    </div>
  );
}
