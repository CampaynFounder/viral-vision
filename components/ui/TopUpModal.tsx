"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { pricingTiers } from "@/lib/constants/pricing";
import { hapticMedium } from "@/lib/utils/haptics";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const router = useRouter();

  const handleUpsell = (tierId: string) => {
    hapticMedium();
    router.push(`/checkout?product=${tierId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-mocha-light hover:text-mocha transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-champagne"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="heading-luxury text-3xl text-mocha mb-2">
                  You've Reached Your Limit
                </h2>
                <p className="text-mocha-light">
                  Unlock the vault for unlimited access. Secure the bag.
                </p>
              </div>

              {/* Upsell Options */}
              <div className="space-y-3">
                {pricingTiers.map((tier) => (
                  <motion.button
                    key={tier.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpsell(tier.id)}
                    className={`w-full p-4 rounded-xl border-2 touch-target transition-all text-left ${
                      tier.popular
                        ? "border-champagne bg-champagne/5"
                        : "border-stone-200 bg-white hover:border-champagne/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="heading-luxury text-lg text-mocha-dark mb-1">
                          {tier.name}
                        </h3>
                        <p className="text-sm text-mocha">
                          {tier.credits === "unlimited"
                            ? "Unlimited generation"
                            : `${tier.credits} credits`}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-champagne">
                        {tier.priceDisplay}
                      </span>
                    </div>
                    {tier.popular && (
                      <span className="body-luxury text-xs bg-champagne text-white px-2 py-1 rounded-full mt-2 inline-block">
                        Most Popular
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

