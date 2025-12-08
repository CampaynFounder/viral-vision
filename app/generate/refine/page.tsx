"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AestheticSelector from "@/components/ui/AestheticSelector";
import { aesthetics, shotTypes, wardrobes } from "@/lib/constants/aesthetics";
import { Aesthetic, ShotType, Wardrobe } from "@/lib/constants/aesthetics";
import { motion, AnimatePresence } from "framer-motion";
import { hapticMedium, hapticLight } from "@/lib/utils/haptics";
import WizardField from "@/components/wizard/WizardField";
import FirstTimeBonusModal from "@/components/ui/FirstTimeBonusModal";
import ValidationPanel from "@/components/wizard/ValidationPanel";
import { PromptWizardData, ModelType } from "@/lib/types/prompt-wizard";
import { generateEnhancedPrompt } from "@/lib/utils/prompt-engine-v2";
import { getDefaultsForAesthetic, getSuggestionsForField } from "@/lib/utils/smart-defaults";
import { calculateCreditCost, getConversionMessage } from "@/lib/utils/credit-calculator";
import CreditCostDisplay from "@/components/ui/CreditCostDisplay";
import StatusNotification, { StatusType } from "@/components/ui/StatusNotification";
import { trackPromptGeneration } from "@/lib/utils/usage-tracker";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  initializeUserCredits,
  hasReceivedFirstTimeBonus,
  grantFirstTimeBonus,
  isEligibleForFirstTimeBonus,
} from "@/lib/utils/credits-manager";

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
  const [recommendedNegativePrompts, setRecommendedNegativePrompts] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [hasReceivedBonus, setHasReceivedBonus] = useState(false);
  
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
    });

    // Load credits and generation count using credits manager from Supabase
    const loadCredits = async () => {
      const userCredits = await initializeUserCredits(user?.id || null);
      setCredits(userCredits.isUnlimited ? Infinity : userCredits.credits);
      setIsUnlimited(userCredits.isUnlimited);
    };
    
    loadCredits();

    const storedGenerations = localStorage.getItem("totalGenerations");
    if (storedGenerations) {
      setTotalGenerations(parseInt(storedGenerations, 10));
    }

    // Check if user has received first-time bonus
    const userId = user?.id || null;
    const received = hasReceivedFirstTimeBonus(userId);
    setHasReceivedBonus(received);
  }, [router, user]);

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

  // Shared generation logic
  const executeGeneration = async (currentCredits: number) => {
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
      const newCredits = currentCredits - creditCost.totalCost;
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
          aesthetic: selectedAesthetic,
          shotType: selectedShotType,
          wardrobe: selectedWardrobe,
          wizardData,
          model: selectedModel,
        }),
      });
      
      if (!response.ok) throw new Error("Generation failed");
      
      const result = await response.json();
      
      // Debug: Log OpenAI call status and full response
      console.log("📥 Full API Response received:", result);
      
      if (result._debug) {
        if (result._debug.openaiCalled) {
          console.log("✅ OpenAI API was called successfully");
          console.log("📊 OpenAI Model:", result._debug.model);
          console.log("🕐 Timestamp:", result._debug.timestamp);
          console.log("📄 Raw OpenAI Response:", result._debug.rawOpenAIResponse);
          console.log("📋 Parsed OpenAI Content:", result._debug.parsedContent);
          console.log("📝 Final Prompt:", result.prompt);
          console.log("🚫 Negative Prompt:", result.negativePrompt);
          console.log("🎣 Hooks:", result.hooks);
          console.log("🎵 Audio:", result.audio);
        } else {
          console.warn("⚠️ OpenAI API was NOT called");
          console.warn("📋 Reason:", result._debug.reason);
          console.warn("🔄 Using fallback response");
        }
      } else {
        console.log("ℹ️ No debug info available (older API version)");
      }
      
      setSanityCheckResult(result.sanityCheck);
      
      // Store recommended negative prompts and auto-accept them
      if (result.recommendedNegativePrompts && Array.isArray(result.recommendedNegativePrompts) && result.recommendedNegativePrompts.length > 0) {
        setRecommendedNegativePrompts(result.recommendedNegativePrompts);
        // Auto-accept: merge with existing negative prompts, avoiding duplicates
        const existing = wizardData.negativePrompts || [];
        const merged = [...new Set([...result.recommendedNegativePrompts, ...existing])];
        updateWizardData("negativePrompts", merged);
        setShowRecommendations(true);
      }
      
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
          wizardData: {
            ...wizardData,
            negativePrompts: wizardData.negativePrompts || result.recommendedNegativePrompts || [],
          },
          model: selectedModel,
          formattedPrompt: prompt,
          creditCost: creditCost.totalCost,
          openaiPrompt: result.prompt,
          openaiNegativePrompt: result.negativePrompt,
          openaiHooks: result.hooks,
          openaiAudio: result.audio,
          sanityCheck: result.sanityCheck,
          recommendedNegativePrompts: result.recommendedNegativePrompts || [],
          // Store full OpenAI response for debugging/display
          openaiFullResponse: result._debug?.rawOpenAIResponse || null,
          openaiParsedContent: result._debug?.parsedContent || null,
          openaiDebug: result._debug || null,
        })
      );
      
      setStatus(null);
      
      // After first generation, ensure credits are at 0 (bonus was used)
      if (totalGenerations === 0 && !isUnlimited) {
        setCredits(0);
        localStorage.setItem("credits", "0");
      }
      
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

  const handleContinue = async () => {
    // Check if user has enough credits
    if (credits !== Infinity && credits < creditCost.totalCost) {
      // Check if eligible for first-time bonus
      const userId = user?.id || null;
      const isFirstPrompt = totalGenerations === 0;
      const eligibleForBonus = isEligibleForFirstTimeBonus(
        userId,
        credits,
        creditCost.totalCost,
        totalGenerations
      );

      if (eligibleForBonus && isFirstPrompt) {
        // Show bonus modal
        setShowBonusModal(true);
        return;
      }

      // Not eligible, redirect to checkout
      router.push("/checkout?product=viral-starter");
      return;
    }

    await executeGeneration(credits);
  };

  const handleContinueAfterBonus = async () => {
    // Get updated credits after bonus was granted
    const updatedCredits = credits + 5;
    await executeGeneration(updatedCredits);
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

        {/* Subject Details Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="body-luxury text-xs text-mocha-light mb-4">Subject Details</h3>
          <div className="space-y-4 bg-white rounded-2xl p-4 sm:p-6 border border-stone-200">
            {/* Format Toggle */}
            <div className="mb-4">
              <label className="block mb-2">
                <span className="body-luxury text-xs text-mocha-dark font-medium">
                  Format <span className="text-mocha-light">(optional)</span>
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["image", "video"] as const).map((format) => {
                  const isSelected = wizardData.format === format;
                  return (
                    <motion.button
                      key={format}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        hapticLight();
                        updateWizardData("format", format);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium min-h-[44px] flex items-center justify-center ${
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
                        className="capitalize"
                        style={{ color: isSelected ? "#B8941F" : "#6B5A42" }}
                      >
                        {format}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Race */}
            <WizardField
              label="Race"
              description="Optional - defaults to African American if not specified"
              type="select"
              options={["African American", "Caucasian", "Asian", "Hispanic/Latino", "Mixed", "Other", "Prefer not to say"]}
              value={wizardData.race || ""}
              onChange={(value) => updateWizardData("race", value)}
              isOptional={true}
            />

            {/* Skin Tone */}
            <WizardField
              label="Skin Tone"
              description="Optional"
              type="select"
              options={["Dark", "Light", "Brown", "Bronze"]}
              value={wizardData.skinTone || ""}
              onChange={(value) => updateWizardData("skinTone", value)}
              isOptional={true}
            />

            {/* Hair Color */}
            <WizardField
              label="Hair Color"
              description="Optional"
              type="select"
              options={["Black", "Blonde", "Burgundy", "Neon", "Brown", "Red", "Other"]}
              value={wizardData.hairColor || ""}
              onChange={(value) => updateWizardData("hairColor", value)}
              isOptional={true}
            />

            {/* Eyebrow Effect */}
            <WizardField
              label="Eyebrow Effect"
              description="Optional - select an eyebrow enhancement effect"
              type="select"
              options={[
                "Brauenlifting Effekt",
                "Fox-Eye Effect",
                "Doll-Eye Effect",
                "Shadow Lift",
                "Highlighting Brow Bone",
                "Laminated Brow",
                "Gradient Brow",
                "Highlighted Inner",
                "Upper Lash Lift",
                "Snatched Contour"
              ]}
              value={wizardData.eyebrowEffect || ""}
              onChange={(value) => updateWizardData("eyebrowEffect", value)}
              isOptional={true}
            />
          </div>
        </div>

        {/* Video-Specific Fields - Only show when format is "video" */}
        {wizardData.format === "video" && (
          <div className="mb-6 sm:mb-8">
            <h3 className="body-luxury text-xs text-mocha-light mb-4">Video Details</h3>
            <div className="space-y-4 bg-white rounded-2xl p-4 sm:p-6 border border-stone-200">
              {/* Action Field - CRITICAL for video */}
              <WizardField
                label="Action"
                description="Required for video - Describe physics-based movement (e.g., 'walking confidently', 'sipping champagne', 'wind blowing through hair'). Avoid static poses."
                type="text"
                value={wizardData.action || ""}
                onChange={(value) => updateWizardData("action", value)}
                placeholder="e.g., walking confidently toward camera, sipping champagne..."
                isOptional={false}
              />

              {/* Camera Movement */}
              <WizardField
                label="Camera Movement"
                description="Optional - Control camera movement"
                type="select"
                options={[
                  "Static camera",
                  "Slow push-in",
                  "Truck left",
                  "Truck right",
                  "Orbit",
                  "Low angle tracking shot",
                  "Dolly forward",
                  "Dolly backward",
                  "Crane up",
                  "Pan left",
                  "Pan right"
                ]}
                value={wizardData.cameraMovement || ""}
                onChange={(value) => updateWizardData("cameraMovement", value)}
                isOptional={true}
              />

              {/* Video-Specific Negative Prompts */}
              <WizardField
                label="Video Exclusions"
                description="Optional - Video-specific things to avoid"
                type="multi-select"
                options={[
                  "morphing",
                  "distorted hands",
                  "glitching",
                  "too much movement",
                  "static image",
                  "jittery motion",
                  "unnatural movement",
                  "frame inconsistencies"
                ]}
                value={wizardData.videoNegativePrompts || []}
                onChange={(value) => updateWizardData("videoNegativePrompts", value)}
                isOptional={true}
              />
            </div>
          </div>
        )}

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

              {/* Recommended Negative Prompts */}
              {showRecommendations && recommendedNegativePrompts.length > 0 && (
                <div className="mb-6 p-4 bg-champagne/10 border-2 border-champagne/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="body-luxury text-xs text-mocha-dark font-semibold mb-1">
                        Recommended Negative Prompts
                      </h4>
                      <p className="text-xs text-mocha-light">
                        Based on your selections and best practices
                      </p>
                    </div>
                    <button
                      onClick={() => setShowRecommendations(false)}
                      className="text-mocha-light hover:text-mocha text-sm"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recommendedNegativePrompts.map((term, idx) => {
                      const isSelected = wizardData.negativePrompts?.includes(term);
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            hapticLight();
                            const current = wizardData.negativePrompts || [];
                            if (isSelected) {
                              updateWizardData("negativePrompts", current.filter(t => t !== term));
                            } else {
                              updateWizardData("negativePrompts", [...current, term]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium touch-target transition-all ${
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
                          {term}
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-mocha-light italic">
                    ✓ All recommendations have been auto-accepted. Click to remove any you don't want.
                  </p>
                </div>
              )}

              {/* Negative Prompts */}
              <WizardField
                label="Additional Negative Prompts"
                description="Add custom exclusions (optional)"
                type="multi-select"
                options={[
                  "blurry",
                  "low quality",
                  "distorted",
                  "ugly",
                  "text",
                  "watermarks",
                  "bad anatomy",
                  "extra limbs",
                  "deformed",
                  "bad proportions",
                  "cloned face",
                  "disfigured",
                  "out of frame",
                  "bad hands",
                  "mutation",
                  "duplicate",
                  "morbid",
                  "mutilated",
                  "extra fingers",
                  "missing fingers",
                  "too many fingers",
                  "cropped",
                  "worst quality",
                  "jpeg artifacts",
                  "signature",
                  "username",
                  "artist name",
                ]}
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


        {/* Credit Cost Display */}
        <div className="mb-6">
          <CreditCostDisplay
            cost={creditCost}
            currentCredits={credits === Infinity ? 999 : credits}
            isUnlimited={credits === Infinity}
            showBonusIndicator={!hasReceivedBonus && totalGenerations === 0}
            isFirstPrompt={totalGenerations === 0}
            onClaimBonus={() => {
              const userId = user?.id || null;
              const isFirstPrompt = totalGenerations === 0;
              const eligibleForBonus = isEligibleForFirstTimeBonus(
                userId,
                credits,
                creditCost.totalCost,
                totalGenerations
              );
              
              if (eligibleForBonus && isFirstPrompt) {
                setShowBonusModal(true);
              }
            }}
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
        {(() => {
          const userId = user?.id || null;
          const isFirstPrompt = totalGenerations === 0;
          const needsCredits = credits !== Infinity && credits < creditCost.totalCost;
          const eligibleForBonus = !hasReceivedBonus && isFirstPrompt && needsCredits && isEligibleForFirstTimeBonus(
            userId,
            credits,
            creditCost.totalCost,
            totalGenerations
          );
          
          // Debug logging (remove in production if needed)
          if (needsCredits && isFirstPrompt) {
            console.log("Bonus eligibility check:", {
              hasReceivedBonus,
              isFirstPrompt,
              needsCredits,
              credits,
              creditCost: creditCost.totalCost,
              totalGenerations,
              eligibleForBonus,
              userId
            });
          }
          
          return (
            <>
              {eligibleForBonus && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    hapticMedium();
                    setShowBonusModal(true);
                  }}
                  disabled={status !== null}
                  className="w-full py-4 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold touch-target min-h-[52px] transition-colors overflow-hidden mb-3 bg-champagne text-white hover:bg-champagne-dark shadow-lg"
                  style={{ backgroundColor: "#D4AF37", color: "#FFFFFF", maxWidth: '100%' }}
                >
                  <span className="truncate block">
                    🎁 Claim 5 Free Credits & Generate
                  </span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                disabled={!validation.isValid || needsCredits || status !== null}
                className={`w-full py-4 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold touch-target min-h-[52px] transition-colors overflow-hidden ${
                  !validation.isValid || needsCredits || status !== null
                    ? "bg-stone-300 text-stone-700 cursor-not-allowed"
                    : "bg-champagne text-white hover:bg-champagne-dark"
                }`}
                style={
                  !validation.isValid || needsCredits || status !== null
                    ? { backgroundColor: "#D1D5DB", color: "#44403C", maxWidth: '100%' }
                    : { backgroundColor: "#D4AF37", color: "#FFFFFF", maxWidth: '100%' }
                }
              >
                <span className="truncate block">
                  {status
                    ? statusMessages[status]
                    : needsCredits
                    ? eligibleForBonus ? "Or Continue Without Bonus" : "Not Enough Credits"
                    : "Continue"}
                </span>
              </motion.button>
            </>
          );
        })()}
      </div>

      {/* First-Time Bonus Modal */}
      <FirstTimeBonusModal
        show={showBonusModal}
        currentCredits={credits}
        requiredCredits={creditCost.totalCost}
        onClaim={async () => {
          const userId = user?.id || null;
          await grantFirstTimeBonus(userId);
          
          // Update local state
          const newCredits = credits + 5;
          setCredits(newCredits);
          setHasReceivedBonus(true);
          setShowBonusModal(false);
          
          // Continue with generation using updated credits
          await executeGeneration(newCredits);
        }}
        onDismiss={() => {
          setShowBonusModal(false);
          router.push("/checkout?product=viral-starter");
        }}
      />
    </div>
  );
}

