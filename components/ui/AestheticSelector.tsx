"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Aesthetic } from "@/lib/constants/aesthetics";
import { hapticLight } from "@/lib/utils/haptics";

interface AestheticSelectorProps {
  aesthetics: Aesthetic[];
  selectedId?: string;
  onSelect: (aesthetic: Aesthetic) => void;
  className?: string;
}

export default function AestheticSelector({
  aesthetics,
  selectedId,
  onSelect,
  className = "",
}: AestheticSelectorProps) {
  const selectedAesthetic = aesthetics.find((a) => a.id === selectedId);

  return (
    <div className={className}>
      <h3 className="body-luxury text-xs text-mocha-light mb-4">The Filter</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {aesthetics.map((aesthetic) => {
          const isSelected = selectedId === aesthetic.id;
          return (
            <motion.button
              key={aesthetic.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticLight();
                onSelect(aesthetic);
              }}
              className={`px-6 py-3 rounded-full font-medium touch-target whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-champagne text-white"
                  : "bg-white text-mocha-dark border-2 border-stone-200 hover:border-stone-300"
              }`}
              style={
                isSelected
                  ? { backgroundColor: '#D4AF37', color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', color: '#6B5A42', borderColor: '#E7E5E4' }
              }
            >
              {aesthetic.name}
            </motion.button>
          );
        })}
      </div>

      {/* Sub-options when selected */}
      <AnimatePresence>
        {selectedAesthetic?.subOptions && selectedAesthetic.subOptions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="flex gap-3 overflow-x-auto pb-2">
              {selectedAesthetic.subOptions.map((subOption) => (
                <button
                  key={subOption.id}
                  onClick={() => {
                    hapticLight();
                    onSelect(subOption);
                  }}
                  className="px-4 py-2 rounded-full bg-stone-100 text-mocha-dark text-sm touch-target whitespace-nowrap hover:bg-stone-200 transition-colors"
                >
                  {subOption.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

