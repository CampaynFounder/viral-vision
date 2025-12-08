"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { hapticMedium } from "@/lib/utils/haptics";

interface FirstTimeBonusModalProps {
  show: boolean;
  currentCredits: number;
  requiredCredits: number;
  onClaim: () => void;
  onDismiss: () => void;
}

export default function FirstTimeBonusModal({
  show,
  currentCredits,
  requiredCredits,
  onClaim,
  onDismiss,
}: FirstTimeBonusModalProps) {
  const [accepted, setAccepted] = useState(false);
  const creditsNeeded = requiredCredits - currentCredits;

  const handleClaim = () => {
    if (!accepted) return;
    hapticMedium();
    onClaim();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-champagne"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gift Icon */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-4 bg-champagne/20 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-10 h-10 text-champagne-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </motion.div>
                <h3 className="heading-luxury text-2xl text-mocha-dark mb-2">
                  🎁 First-Time Bonus!
                </h3>
                <p className="body-luxury text-sm text-mocha-light mb-4">
                  We're gifting you{" "}
                  <span className="font-bold text-champagne-dark">
                    {creditsNeeded} free credits
                  </span>{" "}
                  to complete your first prompt
                </p>
              </div>

              {/* Credit Display */}
              <div className="bg-champagne/10 rounded-xl p-4 mb-6 border border-champagne/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-mocha-light">Current Credits:</span>
                  <span className="font-bold text-mocha-dark" style={{ color: '#1C1917' }}>
                    {currentCredits}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-mocha-light">Required:</span>
                  <span className="font-bold text-mocha-dark" style={{ color: '#1C1917' }}>
                    {requiredCredits}
                  </span>
                </div>
                <div className="border-t border-champagne/30 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-mocha-light">After Bonus:</span>
                    <span
                      className="font-bold text-champagne-dark text-lg"
                      style={{ color: '#B8941F' }}
                    >
                      {currentCredits + creditsNeeded} credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => {
                    setAccepted(e.target.checked);
                    hapticMedium();
                  }}
                  className="mt-1 w-5 h-5 rounded border-2 border-champagne text-champagne focus:ring-champagne focus:ring-offset-0 cursor-pointer"
                  style={{ accentColor: '#D4AF37' }}
                />
                <span className="text-sm text-mocha-dark" style={{ color: '#1C1917' }}>
                  I'd like to receive{" "}
                  <span className="font-semibold text-champagne-dark">
                    {creditsNeeded} free credits
                  </span>{" "}
                  to complete my first prompt
                </span>
              </label>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleClaim}
                  disabled={!accepted}
                  className="w-full py-3 bg-champagne text-white rounded-xl font-medium touch-target hover:bg-champagne-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    backgroundColor: accepted ? "#D4AF37" : "#D4AF37",
                    opacity: accepted ? 1 : 0.5,
                    color: "#FFFFFF",
                  }}
                >
                  Claim Bonus & Generate
                </button>
                <button
                  onClick={onDismiss}
                  className="w-full py-3 border-2 border-stone-300 text-mocha-dark rounded-xl font-medium touch-target hover:bg-stone-50 transition-colors"
                  style={{ color: "#1C1917" }}
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-xs text-mocha-light text-center mt-4" style={{ color: '#6B5A42' }}>
                This is a one-time bonus for first-time users
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

