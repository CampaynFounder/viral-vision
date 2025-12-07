"use client";

import { motion, AnimatePresence } from "framer-motion";
import { hapticMedium } from "@/lib/utils/haptics";

interface FacelessToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export default function FacelessToggle({
  enabled,
  onChange,
  className = "",
}: FacelessToggleProps) {
  const handleToggle = () => {
    hapticMedium();
    onChange(!enabled);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="body-luxury text-mocha text-sm font-medium">
        Faceless Mode
      </span>
      <button
        onClick={handleToggle}
        className={`relative w-[60px] h-[32px] rounded-full transition-colors duration-300 touch-target ${
          enabled ? "bg-champagne" : "bg-stone-300"
        }`}
        aria-label="Toggle faceless mode"
        role="switch"
        aria-checked={enabled}
      >
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center ${
            enabled ? "translate-x-7" : "translate-x-0"
          }`}
        >
          <AnimatePresence mode="wait">
            {enabled && (
              <motion.svg
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="w-4 h-4 text-champagne"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </button>
    </div>
  );
}

