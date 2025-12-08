"use client";

import { motion } from "framer-motion";
import { CreditCostBreakdown } from "@/lib/utils/credit-calculator";

interface CreditCostDisplayProps {
  cost: CreditCostBreakdown;
  currentCredits: number;
  isUnlimited?: boolean;
  className?: string;
  showBonusIndicator?: boolean;
  isFirstPrompt?: boolean;
  onClaimBonus?: () => void;
}

export default function CreditCostDisplay({
  cost,
  currentCredits,
  isUnlimited = false,
  className = "",
  showBonusIndicator = false,
  isFirstPrompt = false,
  onClaimBonus,
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
      {/* First-Time Bonus Indicator */}
      {showBonusIndicator && isFirstPrompt && !canAfford && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-champagne/20 border-2 border-champagne rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎁</span>
            <span className="text-base font-bold text-champagne-dark" style={{ color: '#B8941F' }}>
              First-Time Bonus Available!
            </span>
          </div>
          <p className="text-sm text-mocha-dark font-medium mb-3" style={{ color: '#1C1917' }}>
            Get {cost.totalCost - currentCredits} free credits to complete your first prompt
          </p>
          {onClaimBonus && (
            <button
              onClick={onClaimBonus}
              className="w-full py-2.5 bg-champagne text-white rounded-lg text-sm font-semibold hover:bg-champagne-dark transition-colors touch-target shadow-md"
              style={{ backgroundColor: '#D4AF37', color: '#FFFFFF' }}
            >
              🎁 Claim {cost.totalCost - currentCredits} Free Credits
            </button>
          )}
        </motion.div>
      )}
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
          className="mt-3 p-3 bg-red-100 rounded-lg"
        >
          <p className="text-xs text-red-700 mb-2">
            Not enough credits. {showBonusIndicator && isFirstPrompt ? "Claim your first-time bonus to continue!" : "Upgrade to continue!"}
          </p>
          {showBonusIndicator && isFirstPrompt && onClaimBonus && (
            <button
              onClick={onClaimBonus}
              className="w-full py-2 bg-champagne text-white rounded-lg text-sm font-semibold hover:bg-champagne-dark transition-colors touch-target"
              style={{ backgroundColor: '#D4AF37', color: '#FFFFFF' }}
            >
              🎁 Claim 5 Free Credits
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

