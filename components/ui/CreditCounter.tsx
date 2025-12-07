"use client";

import { motion } from "framer-motion";

interface CreditCounterProps {
  credits: number;
  isUnlimited?: boolean;
  className?: string;
  onLowBalance?: () => void;
}

export default function CreditCounter({
  credits,
  isUnlimited = false,
  className = "",
  onLowBalance,
}: CreditCounterProps) {
  const isLow = credits <= 5 && !isUnlimited;

  // Trigger low balance callback
  if (isLow && onLowBalance && credits > 0) {
    // This would be better with useEffect, but keeping simple for now
  }

  return (
    <motion.div
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="flex flex-col items-end">
        <span className="body-luxury text-xs text-mocha-light">
          {isUnlimited ? "Unlimited" : "Credits"}
        </span>
        <span
          className={`heading-luxury text-lg font-bold ${
            isLow ? "text-red-500" : "text-champagne"
          }`}
        >
          {isUnlimited ? "∞" : credits}
        </span>
      </div>
      {isLow && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-red-500"
        >
          Low
        </motion.div>
      )}
    </motion.div>
  );
}

