"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PromptValidationResult } from "@/lib/types/prompt-wizard";

interface ValidationPanelProps {
  validation: PromptValidationResult;
  onFixConflict?: (conflict: any) => void;
  className?: string;
}

export default function ValidationPanel({
  validation,
  onFixConflict,
  className = "",
}: ValidationPanelProps) {
  const hasErrors = validation.conflicts.some((c) => c.severity === "error");
  const hasWarnings = validation.warnings.length > 0 || validation.conflicts.some((c) => c.severity === "warning");

  return (
    <div className={className}>
      {/* Completeness Meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="body-luxury text-xs text-mocha-dark">
            Prompt Completeness
          </span>
          <span className="heading-luxury text-lg text-champagne">
            {validation.completeness}%
          </span>
        </div>
        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${validation.completeness}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              validation.completeness >= 80
                ? "bg-champagne"
                : validation.completeness >= 50
                ? "bg-yellow-500"
                : "bg-orange-500"
            }`}
          />
        </div>
      </div>

      {/* Errors */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <h4 className="body-luxury text-xs text-red-600 mb-2">
              Conflicts Detected
            </h4>
            <ul className="space-y-2">
              {validation.conflicts
                .filter((c) => c.severity === "error")
                .map((conflict, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    • {conflict.description}
                  </li>
                ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warnings */}
      <AnimatePresence>
        {hasWarnings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"
          >
            <h4 className="body-luxury text-xs text-yellow-600 mb-2">
              Suggestions
            </h4>
            <ul className="space-y-2">
              {validation.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-yellow-700">
                  • {warning}
                </li>
              ))}
              {validation.conflicts
                .filter((c) => c.severity === "warning")
                .map((conflict, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">
                    • {conflict.description}
                  </li>
                ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h4 className="body-luxury text-xs text-blue-600 mb-2">
            Recommendations
          </h4>
          <ul className="space-y-2">
            {validation.suggestions.map((suggestion, idx) => (
              <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                <span>•</span>
                <span>
                  {suggestion.message}
                  {suggestion.action && (
                    <button
                      onClick={() => onFixConflict?.(suggestion)}
                      className="ml-2 text-blue-600 underline hover:text-blue-800"
                    >
                      {suggestion.action}
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

