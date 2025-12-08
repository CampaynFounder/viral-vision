"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { hapticLight } from "@/lib/utils/haptics";

interface ReceiptCardProps {
  prompt: string;
  negativePrompt?: string;
  hooks: string[];
  audio?: string;
  onCopyPrompt?: () => void;
  onCopyHook?: (hook: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function ReceiptCard({
  prompt,
  negativePrompt,
  hooks,
  audio,
  onCopyPrompt,
  onCopyHook,
}: ReceiptCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    hapticLight();
    onCopyPrompt?.();
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyHook = async (hook: string, index: number) => {
    await navigator.clipboard.writeText(hook);
    setCopiedHookIndex(index);
    hapticLight();
    onCopyHook?.(hook);
    setTimeout(() => setCopiedHookIndex(null), 2000);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200"
    >
      {/* Header */}
      <motion.h3
        variants={itemVariants}
        className="heading-luxury text-2xl text-mocha mb-4"
      >
        The Blueprint
      </motion.h3>

      {/* Prompt */}
      <motion.div variants={itemVariants} className="mb-6">
        <p className="text-mocha-dark text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: '#1C1917' }}>
          {prompt}
        </p>
        <button
          onClick={handleCopyPrompt}
          className="mt-3 w-full py-3 bg-champagne text-white rounded-xl font-medium touch-target hover:bg-champagne-dark transition-colors"
        >
          {copiedPrompt ? "✓ Copied!" : "Copy Prompt"}
        </button>
      </motion.div>

      {/* Negative Prompt */}
      {negativePrompt && (
        <motion.div variants={itemVariants} className="mb-6">
          <h4 className="body-luxury text-xs text-mocha-light mb-2">
            Negative Prompt
          </h4>
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <p className="text-mocha-dark text-sm leading-relaxed font-medium" style={{ color: '#1C1917' }}>
              {negativePrompt}
            </p>
          </div>
        </motion.div>
      )}

      {/* Viral Hooks */}
      <motion.div variants={itemVariants} className="mb-6">
        <h4 className="body-luxury text-xs text-mocha-light mb-3">
          Viral Hooks
        </h4>
        <div className="space-y-2">
          {hooks.map((hook, index) => (
            <div
              key={index}
              className="bg-stone-100 p-3 rounded-lg flex items-center justify-between"
            >
              <p className="text-mocha-dark text-sm flex-1 font-medium" style={{ color: '#1C1917' }}>{hook}</p>
              <button
                onClick={() => handleCopyHook(hook, index)}
                className="ml-3 px-4 py-2 border border-champagne text-champagne-dark rounded-lg text-xs font-medium touch-target hover:bg-champagne/10 hover:border-champagne-dark transition-colors"
              >
                {copiedHookIndex === index ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Audio Suggestion */}
      {audio && (
        <motion.div variants={itemVariants}>
          <h4 className="body-luxury text-xs text-mocha-light mb-2">
            Audio Suggestion
          </h4>
          <p className="text-mocha-dark text-sm italic font-medium" style={{ color: '#1C1917' }}>"{audio}"</p>
        </motion.div>
      )}
    </motion.div>
  );
}

