"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AestheticSelector from "@/components/ui/AestheticSelector";
import { aesthetics, shotTypes, wardrobes } from "@/lib/constants/aesthetics";
import { Aesthetic, ShotType, Wardrobe } from "@/lib/constants/aesthetics";
import { motion, AnimatePresence } from "framer-motion";
import { hapticMedium, hapticLight } from "@/lib/utils/haptics";
import WizardField from "@/components/wizard/WizardField";
import PromptPreview from "@/components/wizard/PromptPreview";
import ValidationPanel from "@/components/wizard/ValidationPanel";
import { PromptWizardData, ModelType } from "@/lib/types/prompt-wizard";
import { generateEnhancedPrompt } from "@/lib/utils/prompt-engine-v2";
import { getDefaultsForAesthetic, getSuggestionsForField } from "@/lib/utils/smart-defaults";
import { calculateCreditCost, getConversionMessage } from "@/lib/utils/credit-calculator";
import CreditCostDisplay from "@/components/ui/CreditCostDisplay";
import StatusNotification, { StatusType } from "@/components/ui/StatusNotification";
import { trackPromptGeneration } from "@/lib/utils/usage-tracker";
import { useAuth } from "@/lib/contexts/AuthContext";

const statusMessages: Record<StatusType, string> = {
  thinking: "Thinking...",
  manifesting: "Manifesting...",
  finding: "Glowing Up...",
  optimizing: "Optimizing...",
  finalizing: "Finalizing...",
};

export default function RefinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedAesthetic, setSelectedAesthetic] = useState<Aesthetic | null>(null);
  const [selectedShotType, setSelectedShotType] = useState<ShotType | null>(null);
  const [selectedWardrobe, setSelectedWardrobe] = useState<Wardrobe | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("midjourney");
  const [credits, setCredits] = useState(50);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [status, setStatus] = useState<StatusType | null>(null);
  const [sanityCheckResult, setSanityCheckResult] = useState<any>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  
  // Enhanced wizard data
  const [wizardData, setWizardData] = useState<Partial<PromptWizardData>>({});

  useEffect(() => {
    // Check if we have generation data from previous screen
    const data = sessionStorage.getItem("generationData");
    if (!data) {
      router.push("/generate");
      return;
    }

    // Load initial data
    const parsed = JSON.parse(data);
    setWizardData({
      userInput: parsed.input,
      facelessMode: parsed.facelessMode,
    });

    // Load credits and generation count
    const storedCredits = localStorage.getItem("credits");
    const subscription = localStorage.getItem("subscription");
    if (subscription === "active") {
      setCredits(Infinity);
      setIsUnlimited(true);
    } else if (storedCredits) {
      setCredits(parseInt(storedCredits, 10));
      setIsUnlimited(false);
    } else {
      setCredits(50); // Default starting credits
      setIsUnlimited(false);
    }

    const storedGenerations = localStorage.getItem("totalGenerations");
    if (storedGenerations) {
      setTotalGenerations(parseInt(storedGenerations, 10));
    }
  }, [router]);

  // Apply smart defaults when aesthetic changes
  useEffect(() => {
    if (selectedAesthetic) {
      const defaults = getDefaultsForAesthetic(selectedAesthetic);
      setWizardData((prev) => ({
        ...prev,
        style: selectedAesthetic.id,
        lighting: defaults.lighting[0],
        mood: defaults.mood[0],
        cameraAngle: defaults.cameraAngle[0],
        quality: defaults.quality[0],
        materials: defaults.materials,
        accessories: defaults.accessories,
      }));
    }
  }, [selectedAesthetic]);

  // Generate prompt preview (memoized to prevent infinite loops)
  const { prompt, validation } = useMemo(() => {
    return generateEnhancedPrompt(
      {
        ...wizardData,
        aesthetic: selectedAesthetic || undefined,
        pose: selectedShotType?.keywords,
        clothing: selectedWardrobe?.keywords.join(", "),
      },
      selectedModel
    );
  }, [wizardData, selectedAesthetic, selectedShotType, selectedWardrobe, selectedModel]);

  // Calculate credit cost based on selections
  const creditCost = useMemo(() => {
    // Premium aesthetics: old-money, dark-feminine
    const premiumAesthetics = ['old-money', 'dark-feminine'];
    const isPremium = selectedAesthetic ? premiumAesthetics.includes(selectedAesthetic.id) : false;

    return calculateCreditCost({
      aesthetic: selectedAesthetic ? {
        id: selectedAesthetic.id,
        isPremium,
      } : undefined,
      shotType: selectedShotType ? { id: selectedShotType.id } : undefined,
      wardrobe: selectedWardrobe ? { id: selectedWardrobe.id } : undefined,
      model: selectedModel,
      advancedOptions: {
        lighting: !!wizardData.lighting,
        scene: !!wizardData.scene,
        cameraAngle: !!wizardData.cameraAngle,
        negativePrompts: Array.isArray(wizardData.negativePrompts) && wizardData.negativePrompts.length > 0,
        customParameters: !!wizardData.parameters,
      },
      totalGenerations,
    });
  }, [selectedAesthetic, selectedShotType, selectedWardrobe, selectedModel, wizardData, totalGenerations]);

  // Get conversion message
  const conversionMessage = useMemo(() => {
    if (credits === Infinity) return null;
    return getConversionMessage(credits, creditCost.totalCost, totalGenerations);
  }, [credits, creditCost.totalCost, totalGenerations]);

  const handleContinue = async () => {
    // Check if user has enough credits
    if (credits !== Infinity && credits < creditCost.totalCost) {
      // Show top-up modal or redirect to checkout
      router.push("/checkout?product=viral-starter");
      return;
    }

    hapticMedium();
    
    // Track usage for profitability (even for unlimited users)
    const userId = user?.id || 'anonymous';
    trackPromptGeneration(
      userId,
      isUnlimited,
      creditCost.totalCost,
      selectedModel,
      selectedAesthetic?.id,
      Object.values(wizardData).some(v => v !== undefined && v !== null && v !== "")
    );
    
    // Deduct calculated credits (only for non-unlimited users)
    if (!isUnlimited) {
      const newCredits = credits - creditCost.totalCost;
      setCredits(newCredits);
      localStorage.setItem("credits", newCredits.toString());
    }
    
    // Increment generation count (for all users)
    const newGenCount = totalGenerations + 1;
    setTotalGenerations(newGenCount);
    localStorage.setItem("totalGenerations", newGenCount.toString());
    
    // Call OpenAI API with status updates
    try {
      setStatus("thinking");
      
      const data = JSON.parse(sessionStorage.getItem("generationData") || "{}");
      
      // Step 1: Thinking
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus("manifesting");
      
      // Step 2: Manifesting
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus("finding");
      
      // Step 3: Finding aesthetic
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus("optimizing");
      
      // Step 4: Optimizing
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: data.input,
          facelessMode: data.facelessMode,
          aesthetic: selectedAesthetic,
          shotType: selectedShotType,
          wardrobe: selectedWardrobe,
          wizardData,
          model: selectedModel,
        }),
      });
      
      if (!response.ok) throw new Error("Generation failed");
      
      const result = await response.json();
      setSanityCheckResult(result.sanityCheck);
      
      // Step 5: Finalizing
      setStatus("finalizing");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store refinement data including credit cost and OpenAI result
      sessionStorage.setItem(
        "generationData",
        JSON.stringify({
          ...data,
          aesthetic: selectedAesthetic,
          shotType: selectedShotType,
          wardrobe: selectedWardrobe,
          wizardData,
          model: selectedModel,
          formattedPrompt: prompt,
          creditCost: creditCost.totalCost,
          openaiPrompt: result.prompt,
          openaiHooks: result.hooks,
          openaiAudio: result.audio,
          sanityCheck: result.sanityCheck,
        })
      );
      
      setStatus(null);
      router.push("/generate/result");
    } catch (error) {
      console.error("Generation error:", error);
      setStatus(null);
      // Fallback to local generation
      const data = JSON.parse(sessionStorage.getItem("generationData") || "{}");
      sessionStorage.setItem(
        "generationData",
        JSON.stringify({
          ...data,
          aesthetic: selectedAesthetic,
          shotType: selectedShotType,
          wardrobe: selectedWardrobe,
          wizardData,
          model: selectedModel,
          formattedPrompt: prompt,
          creditCost: creditCost.totalCost,
        })
      );
      router.push("/generate/result");
    }
  };

  const updateWizardData = (field: keyof PromptWizardData, value: any) => {
    setWizardData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-alabaster p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-luxury text-2xl sm:text-3xl text-mocha mb-6 sm:mb-8">
          Refine Your Vibe
        </h1>

        {/* Aesthetic Selector */}
        <div className="mb-6 sm:mb-8">
          <AestheticSelector
            aesthetics={aesthetics}
            selectedId={selectedAesthetic?.id}
            onSelect={setSelectedAesthetic}
          />
        </div>

        {/* Shot Type Selector */}
        <div className="mb-6 sm:mb-8">
          <h3 className="body-luxury text-xs text-mocha-light mb-3 sm:mb-4">The Shot</h3>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {shotTypes.map((shotType) => {
              const isSelected = selectedShotType?.id === shotType.id;
              return (
                <motion.button
                  key={shotType.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    hapticLight();
                    setSelectedShotType(shotType);
                    updateWizardData("pose", shotType.keywords);
                  }}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-medium touch-target whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center overflow-hidden flex-shrink-0 ${
                    isSelected
                      ? "bg-champagne text-white"
                      : "bg-white text-mocha-dark border-2 border-stone-200 hover:border-stone-300"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: '#D4AF37', color: '#FFFFFF', maxWidth: '200px', minWidth: 'fit-content' }
                      : { backgroundColor: '#FFFFFF', color: '#6B5A42', borderColor: '#E7E5E4', maxWidth: '200px', minWidth: 'fit-content' }
                  }
                >
                  <span className="truncate block max-w-[180px]">{shotType.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Wardrobe Selector */}
        <div className="mb-6 sm:mb-8">
          <h3 className="body-luxury text-xs text-mocha-light mb-3 sm:mb-4">The Wardrobe</h3>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {wardrobes.map((wardrobe) => {
              const isSelected = selectedWardrobe?.id === wardrobe.id;
              return (
                <motion.button
                  key={wardrobe.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    hapticLight();
                    setSelectedWardrobe(wardrobe);
                    updateWizardData("clothing", wardrobe.keywords.join(", "));
                  }}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-medium touch-target whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center overflow-hidden flex-shrink-0 ${
                    isSelected
                      ? "bg-champagne text-white"
                      : "bg-white text-mocha-dark border-2 border-stone-200 hover:border-stone-300"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: '#D4AF37', color: '#FFFFFF', maxWidth: '200px', minWidth: 'fit-content' }
                      : { backgroundColor: '#FFFFFF', color: '#6B5A42', borderColor: '#E7E5E4', maxWidth: '200px', minWidth: 'fit-content' }
                  }
                >
                  <span className="truncate block max-w-[180px]">{wardrobe.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            hapticLight();
            setShowAdvanced(!showAdvanced);
          }}
          className="w-full py-3.5 sm:py-3 mb-6 border-2 border-stone-200 rounded-xl bg-white text-mocha-dark text-sm sm:text-base font-medium touch-target min-h-[44px] hover:border-champagne transition-colors"
        >
          {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
        </motion.button>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 space-y-6"
            >
              {/* Model Selection */}
              <div className="mb-6">
                <h3 className="body-luxury text-xs text-mocha-light mb-3 sm:mb-4">AI Model</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2">
                  {(["midjourney", "stable-diffusion", "dalle"] as ModelType[]).map((model) => {
                    const isSelected = selectedModel === model;
                    return (
                      <motion.button
                        key={model}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          hapticLight();
                          setSelectedModel(model);
                          updateWizardData("model", model);
                        }}
                        className={`p-3 sm:p-3 rounded-xl border-2 transition-all text-sm font-medium min-h-[44px] flex items-center justify-center overflow-hidden ${
                          isSelected
                            ? "border-champagne bg-champagne/10"
                            : "border-stone-200 bg-white hover:border-champagne/50"
                        }`}
                        style={
                          isSelected
                            ? { borderColor: "#D4AF37", backgroundColor: "rgba(212, 175, 55, 0.1)", maxWidth: '100%' }
                            : { maxWidth: '100%' }
                        }
                      >
                        <span className="truncate block max-w-full" style={{ color: isSelected ? "#B8941F" : "#6B5A42" }}>
                          {model === "midjourney" && "Midjourney"}
                          {model === "stable-diffusion" && "Stable Diffusion"}
                          {model === "dalle" && "DALL·E"}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Lighting */}
              <WizardField
                label="Lighting"
                description="Set the mood with lighting"
                type="select"
                options={getSuggestionsForField("lighting", wizardData)}
                value={wizardData.lighting || ""}
                onChange={(value) => updateWizardData("lighting", value)}
                suggestions={getSuggestionsForField("lighting", wizardData)}
              />

              {/* Scene */}
              <WizardField
                label="Scene"
                description="Where is this taking place?"
                type="text"
                value={wizardData.scene || ""}
                onChange={(value) => updateWizardData("scene", value)}
                placeholder="luxury hotel lobby, beach club, coffee shop..."
                suggestions={getSuggestionsForField("scene", wizardData)}
              />

              {/* Camera Angle */}
              <WizardField
                label="Camera Angle"
                description="How should the shot be framed?"
                type="select"
                options={["eye level", "bird's eye", "low angle", "dutch angle"]}
                value={wizardData.cameraAngle || ""}
                onChange={(value) => updateWizardData("cameraAngle", value)}
              />

              {/* Negative Prompts */}
              <WizardField
                label="Negative Prompts"
                description="What to exclude from the image"
                type="multi-select"
                options={["blurry", "low quality", "distorted", "ugly", "text", "watermarks"]}
                value={wizardData.negativePrompts || []}
                onChange={(value) => updateWizardData("negativePrompts", value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Panel */}
        {validation && (
          <div className="mb-6">
            <ValidationPanel validation={validation} />
          </div>
        )}

        {/* Status Notification */}
        {status && (
          <div className="mb-6">
            <StatusNotification status={status} />
          </div>
        )}

        {/* Sanity Check Results */}
        {sanityCheckResult && !sanityCheckResult.passed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"
          >
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Prompt Issues Detected</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {sanityCheckResult.issues.map((issue: any, idx: number) => (
                <li key={idx}>• {issue.message}</li>
              ))}
            </ul>
            {sanityCheckResult.suggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-yellow-300">
                <h5 className="text-xs font-semibold text-yellow-800 mb-1">Suggestions:</h5>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {sanityCheckResult.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Prompt Preview */}
        <div className="mb-6 sm:mb-8">
          <PromptPreview prompt={prompt} />
        </div>

        {/* Credit Cost Display */}
        <div className="mb-6">
          <CreditCostDisplay
            cost={creditCost}
            currentCredits={credits === Infinity ? 999 : credits}
            isUnlimited={credits === Infinity}
          />
          {conversionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-champagne/10 border-2 border-champagne rounded-xl"
            >
              <p className="text-sm text-mocha-dark font-medium mb-2">{conversionMessage}</p>
              <button
                onClick={() => router.push("/checkout")}
                className="text-sm text-champagne hover:text-champagne-dark font-semibold touch-target"
              >
                Upgrade Now →
              </button>
            </motion.div>
          )}
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={!validation.isValid || (credits !== Infinity && credits < creditCost.totalCost) || status !== null}
          className={`w-full py-4 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold touch-target min-h-[52px] transition-colors overflow-hidden ${
            !validation.isValid || (credits !== Infinity && credits < creditCost.totalCost) || status !== null
              ? "bg-stone-300 text-stone-700 cursor-not-allowed"
              : "bg-champagne text-white hover:bg-champagne-dark"
          }`}
          style={
            !validation.isValid || (credits !== Infinity && credits < creditCost.totalCost) || status !== null
              ? { backgroundColor: "#D1D5DB", color: "#44403C", maxWidth: '100%' }
              : { backgroundColor: "#D4AF37", color: "#FFFFFF", maxWidth: '100%' }
          }
        >
          <span className="truncate block">
            {status
              ? statusMessages[status]
              : credits !== Infinity && credits < creditCost.totalCost
              ? "Not Enough Credits"
              : "Continue"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}

