"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { hapticMedium } from "@/lib/utils/haptics";

interface PromptHistoryItem {
  prompt: string;
  hooks: string[];
  audio?: string;
  timestamp: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("promptHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const handleExport = () => {
    if (selectedItems.size === 0) {
      alert("Please select prompts to export");
      return;
    }

    hapticMedium();
    const selectedPrompts = Array.from(selectedItems)
      .map((index) => history[index])
      .map((item, idx) => `${idx + 1}. ${item.prompt}\n`)
      .join("\n");

    // Create downloadable text file
    const blob = new Blob([selectedPrompts], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viral-prompts-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
    hapticLight();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-alabaster p-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="heading-luxury text-3xl text-mocha mb-4">
            Your Portfolio
          </h1>
          <p className="text-mocha-light mb-8">
            Your generated prompts will appear here
          </p>
          <button
            onClick={() => router.push("/generate")}
            className="px-8 py-3 bg-champagne text-white rounded-xl font-semibold touch-target hover:bg-champagne-dark transition-colors"
          >
            Generate Your First Prompt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-luxury text-3xl text-mocha mb-1">
              Your Portfolio
            </h1>
            <p className="text-mocha-light text-sm">
              {history.length} prompt{history.length !== 1 ? "s" : ""} generated
            </p>
          </div>
          {selectedItems.size > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-champagne text-white rounded-xl text-sm font-medium touch-target hover:bg-champagne-dark transition-colors"
            >
              Export Selected ({selectedItems.size})
            </button>
          )}
        </div>

        {/* Export All Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedItems(new Set(history.map((_, i) => i)));
            }}
            className="text-sm text-champagne hover:text-champagne-dark transition-colors"
          >
            Select All
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4">
          {history.map((item, index) => {
            const isSelected = selectedItems.has(index);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleSelect(index)}
                className={`p-4 bg-white rounded-xl border-2 cursor-pointer transition-all touch-target ${
                  isSelected
                    ? "border-champagne bg-champagne/5"
                    : "border-stone-200 hover:border-champagne/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                      isSelected
                        ? "border-champagne bg-champagne"
                        : "border-stone-300"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-mocha text-sm line-clamp-2 mb-2">
                      {item.prompt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-mocha-light">
                      <span>{formatDate(item.timestamp)}</span>
                      {item.hooks.length > 0 && (
                        <span>{item.hooks.length} hooks</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* One-Click Resell Button */}
        <div className="mt-8 p-6 bg-champagne/10 rounded-2xl border border-champagne/20">
          <h3 className="heading-luxury text-xl text-mocha-dark mb-2">
            One-Click Resell
          </h3>
          <p className="text-mocha text-sm mb-4">
            Export all your prompts as a formatted list ready for PDF creation.
            Perfect for selling as prompt packs.
          </p>
          <button
            onClick={() => {
              const allPrompts = history
                .map((item, idx) => `${idx + 1}. ${item.prompt}\n`)
                .join("\n");
              const blob = new Blob([allPrompts], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `viral-prompts-pack-${new Date().toISOString().split("T")[0]}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="w-full py-3 bg-champagne text-white rounded-xl font-semibold touch-target hover:bg-champagne-dark transition-colors"
          >
            Export All for Resale
          </button>
        </div>
      </div>
    </div>
  );
}

function hapticLight() {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(5);
  }
}

