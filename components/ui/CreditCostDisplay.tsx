"use client";

import { motion } from "framer-motion";
import { CreditCostBreakdown } from "@/lib/utils/credit-calculator";

interface CreditCostDisplayProps {
  cost: CreditCostBreakdown;
  currentCredits: number;
  isUnlimited?: boolean;
  className?: string;
}

export default function CreditCostDisplay({
  cost,
  currentCredits,
  isUnlimited = false,
  className = "",
}: CreditCostDisplayProps) {
  const canAfford = isUnlimited || currentCredits >= cost.totalCost;
  const remainingAfter = isUnlimited ? Infinity : currentCredits - cost.totalCost;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-4 border-2 ${
        canAfford ? "border-stone-200" : "border-red-300 bg-red-50"
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="body-luxury text-xs text-mocha-light">Generation Cost</span>
        <span
          className={`heading-luxury text-xl font-bold ${
            canAfford ? "text-champagne" : "text-red-500"
          }`}
        >
          {isUnlimited ? "Free" : `${cost.totalCost} credits`}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-mocha-light">Your Credits</span>
            <span className={`font-medium ${canAfford ? "text-mocha" : "text-red-500"}`}>
              {currentCredits}
            </span>
          </div>
          {canAfford && (
            <div className="flex items-center justify-between text-xs text-mocha-light">
              <span>Remaining After</span>
              <span className={remainingAfter <= 5 ? "text-red-500 font-medium" : ""}>
                {remainingAfter}
              </span>
            </div>
          )}
        </>
      )}

      {/* Cost Breakdown (Expandable) */}
      {cost.breakdown.length > 1 && (
        <details className="mt-3">
          <summary className="text-xs text-mocha-light cursor-pointer hover:text-mocha transition-colors">
            View cost breakdown
          </summary>
          <div className="mt-2 space-y-1 pt-2 border-t border-stone-200">
            {cost.breakdown.map((item, index) => (
              <div key={index} className="text-xs text-mocha-light flex justify-between">
                <span>{item.split(":")[0]}</span>
                <span className="text-mocha font-medium">{item.split(":")[1]}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {!canAfford && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-red-100 rounded-lg text-xs text-red-700"
        >
          Not enough credits. Upgrade to continue!
        </motion.div>
      )}
    </motion.div>
  );
}

