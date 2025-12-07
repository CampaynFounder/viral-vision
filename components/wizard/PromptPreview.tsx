"use client";

import { motion } from "framer-motion";
import { FormattedPrompt } from "@/lib/types/prompt-wizard";
import { useState } from "react";
import { hapticLight } from "@/lib/utils/haptics";

interface PromptPreviewProps {
  prompt: FormattedPrompt;
  className?: string;
}

export default function PromptPreview({
  prompt,
  className = "",
}: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.fullPrompt);
    setCopied(true);
    hapticLight();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-6 border-2 border-stone-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="heading-luxury text-lg text-mocha mb-1">
            Prompt Preview
          </h3>
          <p className="text-xs text-mocha-light">
            {prompt.model === "midjourney" && "Midjourney"}
            {prompt.model === "stable-diffusion" && "Stable Diffusion"}
            {prompt.model === "dalle" && "DALL·E"}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-champagne text-white rounded-xl text-sm font-medium touch-target hover:bg-champagne-dark transition-colors"
          style={{ backgroundColor: "#D4AF37", color: "#FFFFFF" }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      <div className="bg-stone-50 rounded-xl p-4 mb-3">
        <pre className="text-xs text-mocha whitespace-pre-wrap font-mono">
          {prompt.positive}
        </pre>
      </div>

      {prompt.negative && (
        <div className="bg-red-50 rounded-xl p-4 mb-3">
          <p className="text-xs text-red-600 font-medium mb-1">Negative:</p>
          <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
            {prompt.negative}
          </pre>
        </div>
      )}

      {prompt.parameters && (
        <div className="bg-champagne/10 rounded-xl p-4">
          <p className="text-xs text-champagne-dark font-medium mb-1">
            Parameters:
          </p>
          <pre className="text-xs text-champagne-dark whitespace-pre-wrap font-mono">
            {prompt.parameters}
          </pre>
        </div>
      )}
    </motion.div>
  );
}

