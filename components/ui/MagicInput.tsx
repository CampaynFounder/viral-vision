"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hapticLight } from "@/lib/utils/haptics";

interface MagicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MagicInput({
  value,
  onChange,
  placeholder = "Describe the vibe...",
  className = "",
}: MagicInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    hapticLight();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <motion.div
      initial={false}
      animate={isFocused ? "focused" : "idle"}
      variants={{
        idle: {
          scale: 1,
          borderColor: "rgba(231, 229, 228, 1)", // stone-200
        },
        focused: {
          scale: 1.02,
          borderColor: "rgba(212, 175, 55, 1)", // champagne gold
        },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative border-2 rounded-2xl bg-white/50 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {/* Liquid gold shimmer effect when focused */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: "100%" }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)",
            }}
          />
        )}
      </AnimatePresence>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-4 bg-transparent font-sans text-lg tracking-wide placeholder:text-stone-400 focus:outline-none resize-none touch-target"
        style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
      />
    </motion.div>
  );
}

