"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreditCounter from "@/components/ui/CreditCounter";
import MagicInput from "@/components/ui/MagicInput";
import FacelessToggle from "@/components/ui/FacelessToggle";
import { motion } from "framer-motion";
import { hapticMedium } from "@/lib/utils/haptics";
import TextShuffler from "@/components/ui/TextShuffler";
import { loadingTexts } from "@/lib/utils/text-shuffler";

// Mock trending aesthetics
const trendingAesthetics = [
  "Quiet Luxury Ski Trip",
  "Dubai Sunset Vibes",
  "Parisian Café Morning",
  "Hamptons Beach House",
  "Y2K Nostalgia",
];

export default function DashboardPage() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [facelessMode, setFacelessMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(Infinity);
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Check subscription status
    const subscription = localStorage.getItem("subscription");
    if (subscription === "active") {
      setCredits(Infinity);
    } else {
      const stored = localStorage.getItem("credits");
      if (stored) setCredits(parseInt(stored, 10));
    }
  }, []);

  const handleTrendClick = (trend: string) => {
    hapticMedium();
    setUserInput(trend);
  };

  const handleManifest = async () => {
    if (!userInput.trim()) return;

    hapticMedium();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem(
        "generationData",
        JSON.stringify({
          input: userInput,
          facelessMode,
        })
      );
      router.push("/generate/refine");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-alabaster p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-luxury text-3xl text-mocha mb-1">
              {greeting}, CEO
            </h1>
            <p className="text-mocha-light text-sm">
              Your content atelier is ready
            </p>
          </div>
          <CreditCounter credits={999} isUnlimited={true} />
        </div>

        {/* Trend Watch Ticker */}
        <div className="mb-8 bg-white rounded-2xl p-4 border border-stone-200">
          <h3 className="body-luxury text-xs text-mocha-light mb-3">
            Trend Watch
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trendingAesthetics.map((trend, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTrendClick(trend)}
                className="px-4 py-2 bg-champagne/10 text-champagne-dark rounded-full text-sm font-medium touch-target whitespace-nowrap border border-champagne/30 hover:bg-champagne/20 hover:border-champagne/40 transition-colors flex-shrink-0"
                style={{ color: '#B8941F' }}
              >
                <span className="block truncate max-w-[200px]">{trend}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Generate */}
        <div className="mb-6">
          <MagicInput
            value={userInput}
            onChange={setUserInput}
            placeholder="What vibe are we monetizing today?"
          />
        </div>

        {/* Faceless Toggle */}
        <div className="mb-8">
          <FacelessToggle enabled={facelessMode} onChange={setFacelessMode} />
        </div>

        {/* Manifest Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleManifest}
          disabled={!userInput.trim() || isLoading}
          className={`w-full py-4 rounded-2xl font-semibold touch-target transition-all overflow-hidden text-ellipsis ${
            !userInput.trim() || isLoading
              ? "bg-stone-300 text-stone-700 cursor-not-allowed"
              : "bg-champagne text-white hover:bg-champagne-dark"
          }`}
          style={
            !userInput.trim() || isLoading
              ? { color: '#44403C', backgroundColor: '#D1D5DB' }
              : { color: '#FFFFFF', backgroundColor: '#D4AF37' }
          }
        >
          <span className="block truncate">
            {isLoading ? (
              <TextShuffler texts={loadingTexts} />
            ) : (
              "Manifest"
            )}
          </span>
        </motion.button>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/portfolio")}
            className="p-4 bg-white rounded-xl border-2 border-stone-200 hover:border-champagne transition-colors text-left overflow-hidden"
          >
            <h3 className="heading-luxury text-lg text-mocha-dark mb-1 truncate">
              Portfolio
            </h3>
            <p className="text-xs text-mocha line-clamp-2">View your creations</p>
          </button>
          <button
            onClick={() => router.push("/generate")}
            className="p-4 bg-white rounded-xl border-2 border-stone-200 hover:border-champagne transition-colors text-left overflow-hidden"
          >
            <h3 className="heading-luxury text-lg text-mocha-dark mb-1 truncate">
              Generator
            </h3>
            <p className="text-xs text-mocha line-clamp-2">Full wizard mode</p>
          </button>
        </div>
      </div>
    </div>
  );
}

