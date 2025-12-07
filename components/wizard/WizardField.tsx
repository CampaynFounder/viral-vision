"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { hapticLight } from "@/lib/utils/haptics";

interface WizardFieldProps {
  label: string;
  description?: string;
  type?: "text" | "select" | "multi-select" | "textarea";
  options?: string[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isOptional?: boolean;
  suggestions?: string[];
  icon?: React.ReactNode;
}

export default function WizardField({
  label,
  description,
  type = "text",
  options,
  value,
  onChange,
  placeholder,
  isOptional = false,
  suggestions = [],
  icon,
}: WizardFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = (option: string) => {
    hapticLight();
    if (type === "multi-select") {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(option)) {
        onChange(current.filter((v) => v !== option));
      } else {
        onChange([...current, option]);
      }
    } else {
      onChange(option);
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2">
        <span className="body-luxury text-xs text-mocha-dark font-medium">
          {label}
          {isOptional && (
            <span className="text-mocha-light ml-1">(optional)</span>
          )}
        </span>
        {description && (
          <p className="text-xs text-mocha-light mt-1">{description}</p>
        )}
      </label>

      {/* Suggestions (Quick Select) */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((suggestion) => {
            const isSelected =
              type === "multi-select"
                ? Array.isArray(value) && value.includes(suggestion)
                : value === suggestion;

            return (
              <motion.button
                key={suggestion}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(suggestion)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium touch-target transition-all min-h-[36px] flex items-center ${
                  isSelected
                    ? "bg-champagne text-white"
                    : "bg-white text-mocha-dark border border-stone-200"
                }`}
                style={
                  isSelected
                    ? { backgroundColor: "#D4AF37", color: "#FFFFFF" }
                    : { backgroundColor: "#FFFFFF", color: "#6B5A42" }
                }
              >
                {suggestion}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Input Field */}
      {type === "text" || type === "textarea" ? (
        <motion.div
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          className="relative"
        >
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne">
              {icon}
            </div>
          )}
          {type === "textarea" ? (
            <textarea
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={`w-full min-h-[100px] p-3 sm:p-4 text-sm sm:text-base border-2 border-stone-200 rounded-xl bg-white focus:outline-none focus:border-champagne transition-colors ${
                icon ? "pl-10 sm:pl-12" : ""
              }`}
            />
          ) : (
            <input
              type="text"
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={`w-full p-3 sm:p-4 text-sm sm:text-base min-h-[44px] border-2 border-stone-200 rounded-xl bg-white focus:outline-none focus:border-champagne transition-colors ${
                icon ? "pl-10 sm:pl-12" : ""
              }`}
            />
          )}
        </motion.div>
      ) : type === "select" && options ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2">
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option)}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left min-h-[44px] flex items-center ${
                  isSelected
                    ? "border-champagne bg-champagne/10"
                    : "border-stone-200 bg-white hover:border-champagne/50"
                }`}
                style={
                  isSelected
                    ? { borderColor: "#D4AF37", backgroundColor: "rgba(212, 175, 55, 0.1)" }
                    : {}
                }
              >
                <span
                  className="text-sm sm:text-base font-medium"
                  style={{ color: isSelected ? "#B8941F" : "#6B5A42" }}
                >
                  {option}
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

