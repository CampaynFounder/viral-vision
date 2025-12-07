"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { hapticLight } from "@/lib/utils/haptics";

interface WizardStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: ReactNode;
  isOptional?: boolean;
  onSkip?: () => void;
  className?: string;
}

export default function WizardStep({
  step,
  totalSteps,
  title,
  description,
  children,
  isOptional = false,
  onSkip,
  className = "",
}: WizardStepProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="body-luxury text-xs text-mocha-light">
            Step {step} of {totalSteps}
          </span>
          {isOptional && onSkip && (
            <button
              onClick={() => {
                hapticLight();
                onSkip();
              }}
              className="body-luxury text-xs text-champagne hover:text-champagne-dark transition-colors"
            >
              Skip
            </button>
          )}
        </div>
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-champagne rounded-full"
          />
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="heading-luxury text-2xl text-mocha mb-2">{title}</h2>
        {description && (
          <p className="text-mocha-light text-sm mb-6">{description}</p>
        )}
        {children}
      </motion.div>
    </div>
  );
}

