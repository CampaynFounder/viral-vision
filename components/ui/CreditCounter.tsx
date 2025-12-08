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
        <span 
          className="body-luxury text-xs font-bold"
          style={{ 
            color: '#FFFFFF', 
            textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)' 
          }}
        >
          {isUnlimited ? "Unlimited" : "Credits"}
        </span>
        <span
          className="heading-luxury text-lg font-bold"
          style={
            isLow 
              ? { 
                  color: '#FF6B6B', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(220,38,38,0.4), 0 1px 2px rgba(0,0,0,0.5)' 
                }
              : { 
                  color: '#D4AF37', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(212,175,55,0.3), 0 1px 2px rgba(0,0,0,0.4)' 
                }
          }
        >
          {isUnlimited ? "∞" : credits}
        </span>
      </div>
      {isLow && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-bold"
          style={{ 
            color: '#FF6B6B', 
            textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(220,38,38,0.4), 0 1px 2px rgba(0,0,0,0.5)' 
          }}
        >
          Low
        </motion.div>
      )}
    </motion.div>
  );
}

