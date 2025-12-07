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
      <h3 className="body-luxury text-xs text-mocha-light mb-3 sm:mb-4">The Filter</h3>
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
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
              className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-medium touch-target whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center overflow-hidden flex-shrink-0 ${
                isSelected
                  ? "bg-champagne text-white"
                  : "bg-white text-mocha-dark border-2 border-stone-200 hover:border-stone-300"
              }`}
              style={
                isSelected
                  ? { backgroundColor: '#D4AF37', color: '#FFFFFF', maxWidth: '200px', minWidth: 'fit-content' }
                  : { backgroundColor: '#FFFFFF', color: '#6B5A42', borderColor: '#E7E5E4', maxWidth: '200px', minWidth: 'fit-content' }
              }
            >
              <span className="truncate block max-w-[180px]">{aesthetic.name}</span>
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
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {selectedAesthetic.subOptions.map((subOption) => (
                <button
                  key={subOption.id}
                  onClick={() => {
                    hapticLight();
                    onSelect(subOption);
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-stone-100 text-mocha-dark text-xs sm:text-sm touch-target whitespace-nowrap min-h-[40px] flex items-center justify-center hover:bg-stone-200 transition-colors overflow-hidden flex-shrink-0"
                  style={{ maxWidth: '180px', minWidth: 'fit-content' }}
                >
                  <span className="truncate block max-w-[160px]">{subOption.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

