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

export default function RefinePage() {
  const router = useRouter();
  const [selectedAesthetic, setSelectedAesthetic] = useState<Aesthetic | null>(null);
  const [selectedShotType, setSelectedShotType] = useState<ShotType | null>(null);
  const [selectedWardrobe, setSelectedWardrobe] = useState<Wardrobe | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("midjourney");
  
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

  const handleContinue = () => {
    hapticMedium();
    // Store refinement data
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
      })
    );
    router.push("/generate/result");
  };

  const updateWizardData = (field: keyof PromptWizardData, value: any) => {
    setWizardData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-alabaster p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-luxury text-3xl text-mocha mb-8">
          Refine Your Vibe
        </h1>

        {/* Aesthetic Selector */}
        <div className="mb-8">
          <AestheticSelector
            aesthetics={aesthetics}
            selectedId={selectedAesthetic?.id}
            onSelect={setSelectedAesthetic}
          />
        </div>

        {/* Shot Type Selector */}
        <div className="mb-8">
          <h3 className="body-luxury text-xs text-mocha-light mb-4">The Shot</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
                  className={`px-6 py-3 rounded-full font-medium touch-target whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-champagne text-white"
                      : "bg-white text-mocha-dark border-2 border-stone-200 hover:border-stone-300"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: '#D4AF37', color: '#FFFFFF' }
                      : { backgroundColor: '#FFFFFF', color: '#6B5A42', borderColor: '#E7E5E4' }
                  }
                >
                  {shotType.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Wardrobe Selector */}
        <div className="mb-8">
          <h3 className="body-luxury text-xs text-mocha-light mb-4">The Wardrobe</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
                  className={`px-6 py-3 rounded-full font-medium touch-target whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-champagne text-white"
                      : "bg-white text-mocha-dark border-2 border-stone-200 hover:border-stone-300"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: '#D4AF37', color: '#FFFFFF' }
                      : { backgroundColor: '#FFFFFF', color: '#6B5A42', borderColor: '#E7E5E4' }
                  }
                >
                  {wardrobe.name}
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
          className="w-full py-3 mb-6 border-2 border-stone-200 rounded-xl bg-white text-mocha-dark font-medium touch-target hover:border-champagne transition-colors"
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
                <h3 className="body-luxury text-xs text-mocha-light mb-4">AI Model</h3>
                <div className="grid grid-cols-3 gap-2">
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
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
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
                        <span style={{ color: isSelected ? "#B8941F" : "#6B5A42" }}>
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

        {/* Prompt Preview */}
        <div className="mb-8">
          <PromptPreview prompt={prompt} />
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={!validation.isValid}
          className={`w-full py-4 rounded-2xl font-semibold touch-target transition-colors ${
            !validation.isValid
              ? "bg-stone-300 text-stone-700 cursor-not-allowed"
              : "bg-champagne text-white hover:bg-champagne-dark"
          }`}
          style={
            !validation.isValid
              ? { backgroundColor: "#D1D5DB", color: "#44403C" }
              : { backgroundColor: "#D4AF37", color: "#FFFFFF" }
          }
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}

