"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReceiptCard from "@/components/ui/ReceiptCard";
import { generatePrompt, generateViralHooks, generateAudioSuggestion } from "@/lib/utils/prompt-engine";
import { PromptGenerationInput } from "@/lib/utils/prompt-engine";
import { Aesthetic, ShotType, Wardrobe } from "@/lib/constants/aesthetics";
import { FormattedPrompt } from "@/lib/types/prompt-wizard";
import { hapticMedium } from "@/lib/utils/haptics";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import { initializeUserCredits } from "@/lib/utils/credits-manager";
import BottomSheet from "@/components/ui/BottomSheet";

export default function ResultPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [hooks, setHooks] = useState<string[]>([]);
  const [audio, setAudio] = useState<string>("");
  const [formattedPrompt, setFormattedPrompt] = useState<FormattedPrompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState(5);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [totalGenerations, setTotalGenerations] = useState(0);

  useEffect(() => {
    // Load credits and generation count
    const userCredits = initializeUserCredits(user?.id || null);
    setCredits(userCredits.isUnlimited ? Infinity : userCredits.credits);
    setIsUnlimited(userCredits.isUnlimited);
    
    const storedGenerations = localStorage.getItem("totalGenerations");
    if (storedGenerations) {
      setTotalGenerations(parseInt(storedGenerations, 10));
    }

    // Get generation data
    const data = sessionStorage.getItem("generationData");
    if (!data) {
      router.push("/generate");
      return;
    }

    const parsed = JSON.parse(data);

    // Check if we have OpenAI-generated prompt
    if (parsed.openaiPrompt) {
      setPrompt(parsed.openaiPrompt);
      setNegativePrompt(parsed.openaiNegativePrompt || "");
      setHooks(parsed.openaiHooks || []);
      setAudio(parsed.openaiAudio || "");
    } else if (parsed.formattedPrompt) {
      // Check if we have enhanced formatted prompt from wizard
      setFormattedPrompt(parsed.formattedPrompt);
      setPrompt(parsed.formattedPrompt.fullPrompt || parsed.formattedPrompt.positive);
      
      // Generate hooks (using the prompt text)
      const promptText = parsed.formattedPrompt.fullPrompt || parsed.formattedPrompt.positive;
      const generatedHooks = generateViralHooks(promptText);
      setHooks(generatedHooks);

      // Generate audio suggestion
      const generatedAudio = generateAudioSuggestion(promptText);
      setAudio(generatedAudio);
    } else {
      // Fallback to legacy prompt generation
      const input: PromptGenerationInput = {
        userInput: parsed.input,
        aesthetic: parsed.aesthetic,
        shotType: parsed.shotType,
        wardrobe: parsed.wardrobe,
      };

      // Generate prompt
      const generatedPrompt = generatePrompt(input);
      setPrompt(generatedPrompt);
      
      // Generate hooks (using the prompt text)
      const generatedHooks = generateViralHooks(generatedPrompt);
      setHooks(generatedHooks);

      // Generate audio suggestion
      const generatedAudio = generateAudioSuggestion(generatedPrompt);
      setAudio(generatedAudio);
    }

    // Save to history (localStorage for now)
    const history = JSON.parse(localStorage.getItem("promptHistory") || "[]");
    history.unshift({
      prompt: parsed.openaiPrompt || formattedPrompt?.fullPrompt || prompt,
      hooks: parsed.openaiHooks || hooks,
      audio: parsed.openaiAudio || audio,
      timestamp: new Date().toISOString(),
      formattedPrompt: formattedPrompt || undefined,
    });
    localStorage.setItem("promptHistory", JSON.stringify(history.slice(0, 50))); // Keep last 50
  }, [router, prompt, formattedPrompt, hooks, audio, user]);

  const handleCopyCompletePrompt = async () => {
    if (!prompt) return;
    
    // Copy both positive and negative prompt if available
    const fullPrompt = negativePrompt 
      ? `${prompt}\n\nNegative: ${negativePrompt}`
      : prompt;
    
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    hapticMedium();
    
    // Analytics placeholder
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "copy_prompt", {
        event_category: "engagement",
      });
    }
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAnother = () => {
    hapticMedium();
    
    // Check credits
    const currentCredits = credits === Infinity ? 999 : credits;
    const isFirstTimeUser = totalGenerations === 0;
    
    // If user has 0 credits (first-time user) or 5 or less credits, show upgrade
    if (currentCredits === 0 || (currentCredits <= 5 && !isUnlimited)) {
      setShowUpgradeModal(true);
      return;
    }
    
    // User has enough credits, proceed to generate
    router.push("/generate");
  };

  const handleViewPortfolio = () => {
    hapticMedium();
    router.push("/portfolio");
  };

  return (
    <div className="min-h-screen bg-alabaster p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Prominent 1-Click Copy Button */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleCopyCompletePrompt}
          className="w-full mb-6 py-4 bg-champagne text-white rounded-xl font-bold text-lg touch-target hover:bg-champagne-dark transition-all shadow-lg hover:shadow-xl"
          style={{ backgroundColor: '#D4AF37', color: '#FFFFFF' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {copied ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied to Clipboard!
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Complete Prompt
            </span>
          )}
        </motion.button>

        <ReceiptCard
          prompt={prompt}
          negativePrompt={negativePrompt}
          hooks={hooks}
          audio={audio}
          onCopyPrompt={() => {
            // Analytics placeholder
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "copy_prompt", {
                event_category: "engagement",
              });
            }
          }}
        />

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGenerateAnother}
            className="w-full py-3 border-2 border-champagne text-champagne-dark rounded-xl font-medium touch-target hover:bg-champagne/10 hover:border-champagne-dark transition-colors"
            style={{ color: '#B8941F', borderColor: '#D4AF37' }}
            type="button"
          >
            Generate Another
          </button>
          <button
            onClick={handleViewPortfolio}
            className="w-full py-3 bg-stone-200 text-mocha-dark rounded-xl font-medium touch-target hover:bg-stone-300 transition-colors"
            style={{ backgroundColor: '#E7E5E4', color: '#1C1917' }}
            type="button"
          >
            View Portfolio
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <BottomSheet
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Continue"
        titleStyle={{ color: '#1C1917', fontWeight: 'bold' }}
      >
        <div className="py-4">
          <div className="text-center mb-6">
            <p className="text-sm text-mocha-dark mb-4">
              {credits === 0 
                ? "You're out of credits! Upgrade to continue generating prompts."
                : `You have ${credits} credit${credits === 1 ? '' : 's'} remaining. Upgrade now for unlimited access!`
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                hapticMedium();
                router.push("/checkout?product=viral-starter");
              }}
              className="w-full py-3 bg-champagne text-white rounded-xl font-semibold touch-target hover:bg-champagne-dark transition-colors"
              style={{ backgroundColor: '#D4AF37', color: '#FFFFFF' }}
            >
              Get Viral Starter ($27)
            </button>
            <button
              onClick={() => {
                hapticMedium();
                router.push("/checkout?product=ceo-access");
              }}
              className="w-full py-3 bg-champagne-dark text-white rounded-xl font-semibold touch-target hover:bg-champagne transition-colors shadow-md"
              style={{ backgroundColor: '#B8941F', color: '#FFFFFF' }}
            >
              Get CEO Access ($47/mo) - Unlimited
            </button>
            <button
              onClick={() => {
                hapticMedium();
                setShowUpgradeModal(false);
              }}
              className="w-full py-2 text-mocha hover:text-mocha-dark text-sm touch-target transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

