"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MagicInput from "@/components/ui/MagicInput";
import FacelessToggle from "@/components/ui/FacelessToggle";
import CreditCounter from "@/components/ui/CreditCounter";
import TopUpModal from "@/components/ui/TopUpModal";
import { motion } from "framer-motion";
import { hapticMedium } from "@/lib/utils/haptics";
import TextShuffler from "@/components/ui/TextShuffler";
import { loadingTexts } from "@/lib/utils/text-shuffler";
import { useAuth } from "@/lib/contexts/AuthContext";
import { initializeUserCredits } from "@/lib/utils/credits-manager";

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="text-mocha">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }
  const [userInput, setUserInput] = useState("");
  const [facelessMode, setFacelessMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(50);
  const [showTopUp, setShowTopUp] = useState(false);

  // Load credits and generation count from localStorage
  useEffect(() => {
    // Use credits manager to properly initialize credits
    const userCredits = initializeUserCredits(user?.id || null);
    setCredits(userCredits.isUnlimited ? Infinity : userCredits.credits);

    // Initialize generation count if not exists
    if (!localStorage.getItem("totalGenerations")) {
      localStorage.setItem("totalGenerations", "0");
    }
  }, []);

  const handleLowBalance = () => {
    if (credits > 0 && credits <= 5) {
      setShowTopUp(true);
    }
  };

  const handleManifest = async () => {
    if (!userInput.trim()) return;

    // Note: Credit deduction happens on refine page after user makes selections
    // This page just checks if they have any credits at all
    const hasCredits = credits > 0 || credits === Infinity;
    if (!hasCredits) {
      // Demo mode - allow 3 free generations
      const demoCount = parseInt(localStorage.getItem("demoCount") || "0", 10);
      if (demoCount >= 3) {
        setShowTopUp(true);
        return;
      }
      localStorage.setItem("demoCount", (demoCount + 1).toString());
    }

    hapticMedium();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Store in sessionStorage for next screen
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
            <h1 className="heading-luxury text-3xl text-mocha">Design Your Content</h1>
            {credits === 0 && (
              <p className="text-sm text-mocha-light mt-1">
                Demo mode: {3 - parseInt(localStorage.getItem("demoCount") || "0", 10)} free generations left
              </p>
            )}
          </div>
          {credits > 0 || credits === Infinity ? (
            <CreditCounter
              credits={credits === Infinity ? 999 : credits}
              isUnlimited={credits === Infinity}
              onLowBalance={handleLowBalance}
            />
          ) : null}
        </div>

        {/* Main Input */}
        <div className="mb-6">
          <MagicInput
            value={userInput}
            onChange={setUserInput}
            placeholder="Rich mom running errands in Dubai... or Laptop lifestyle at a beach club..."
          />
        </div>

        {/* Faceless Toggle */}
        <div className="mb-8">
          <FacelessToggle enabled={facelessMode} onChange={setFacelessMode} />
        </div>

        {/* Manifest Button - Always visible */}
        <div className="relative z-10">
          <motion.button
            whileHover={!userInput.trim() || isLoading ? {} : { scale: 1.02 }}
            whileTap={!userInput.trim() || isLoading ? {} : { scale: 0.98 }}
            onClick={handleManifest}
            disabled={!userInput.trim() || isLoading}
            className="w-full py-4 rounded-2xl font-semibold touch-target transition-all relative"
            style={{
              backgroundColor: !userInput.trim() || isLoading ? '#D1D5DB' : '#D4AF37',
              color: !userInput.trim() || isLoading ? '#44403C' : '#FFFFFF',
              cursor: !userInput.trim() || isLoading ? 'not-allowed' : 'pointer',
              opacity: 1,
              visibility: 'visible',
              display: 'block',
              position: 'relative',
              zIndex: 10
            }}
          >
            <span style={{ color: 'inherit' }}>
              {isLoading ? (
                <TextShuffler texts={loadingTexts} />
              ) : (
                "Manifest"
              )}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />
    </div>
  );
}

