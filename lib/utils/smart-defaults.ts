// Smart Defaults System
// Pre-fills fields based on aesthetic selection, user history, and trending combinations

import { Aesthetic } from "@/lib/constants/aesthetics";
import { PromptWizardData } from "@/lib/types/prompt-wizard";

export interface SmartDefaults {
  lighting: string[];
  mood: string[];
  cameraAngle: string[];
  quality: string[];
  materials: string[];
  accessories: string[];
}

// Defaults based on aesthetic selection
export const getDefaultsForAesthetic = (aesthetic: Aesthetic | null): SmartDefaults => {
  if (!aesthetic) {
    return getDefaultDefaults();
  }

  const defaults: Record<string, SmartDefaults> = {
    "old-money": {
      lighting: ["golden hour", "soft natural", "warm ambient"],
      mood: ["serene", "luxurious", "timeless"],
      cameraAngle: ["eye level", "slightly elevated"],
      quality: ["photorealistic", "cinematic", "35mm film"],
      materials: ["linen", "silk", "cashmere", "cotton"],
      accessories: ["gold jewelry", "designer bag", "sunglasses", "watch"],
    },
    "clean-girl": {
      lighting: ["bright natural", "soft natural", "studio"],
      mood: ["fresh", "minimalist", "serene"],
      cameraAngle: ["eye level", "slightly elevated"],
      quality: ["photorealistic", "editorial", "digital"],
      materials: ["cotton", "linen", "silk"],
      accessories: ["minimal jewelry", "designer bag", "sunglasses"],
    },
    "dark-feminine": {
      lighting: ["dramatic", "moody", "low key"],
      mood: ["mysterious", "powerful", "sensual"],
      cameraAngle: ["low angle", "dutch angle", "eye level"],
      quality: ["cinematic", "editorial", "film grain"],
      materials: ["silk", "leather", "velvet"],
      accessories: ["statement jewelry", "designer bag", "heels"],
    },
    "y2k": {
      lighting: ["bright", "colorful", "flash"],
      mood: ["playful", "energetic", "nostalgic"],
      cameraAngle: ["eye level", "close-up"],
      quality: ["film grain", "vintage", "35mm"],
      materials: ["denim", "synthetic", "metallic"],
      accessories: ["chunky jewelry", "mini bag", "platform shoes"],
    },
  };

  return defaults[aesthetic.id] || getDefaultDefaults();
};

const getDefaultDefaults = (): SmartDefaults => ({
  lighting: ["soft natural", "golden hour", "studio"],
  mood: ["serene", "luxurious", "confident"],
  cameraAngle: ["eye level", "slightly elevated"],
  quality: ["photorealistic", "cinematic"],
  materials: ["silk", "linen", "cashmere"],
  accessories: ["gold jewelry", "designer bag"],
});

// Get trending combinations (would be populated from analytics in Phase 2)
export const getTrendingCombinations = (): Partial<PromptWizardData>[] => {
  return [
    {
      scene: "luxury hotel lobby",
      lighting: "golden hour",
      mood: "serene",
      materials: ["silk", "linen"],
    },
    {
      scene: "beach club",
      lighting: "bright natural",
      mood: "energetic",
      materials: ["linen", "cotton"],
    },
    {
      scene: "coffee shop",
      lighting: "soft natural",
      mood: "cozy",
      materials: ["cashmere", "wool"],
    },
  ];
};

// Pre-fill based on user's previous selections (from localStorage)
export const getDefaultsFromHistory = (): Partial<PromptWizardData> => {
  const history = JSON.parse(localStorage.getItem("promptHistory") || "[]");
  if (history.length === 0) return {};

  // Get most common selections from last 10 prompts
  const recent = history.slice(0, 10);
  const preferences: Partial<PromptWizardData> = {};

  // Analyze patterns (simplified - would be more sophisticated in Phase 2)
  const commonLighting = findMostCommon(recent, "lighting");
  const commonMood = findMostCommon(recent, "mood");
  const commonScene = findMostCommon(recent, "scene");

  if (commonLighting) preferences.lighting = commonLighting;
  if (commonMood) preferences.mood = commonMood;
  if (commonScene) preferences.scene = commonScene;

  return preferences;
};

const findMostCommon = (items: any[], field: string): string | null => {
  // Simplified - would use proper analysis in Phase 2
  return null;
};

// Get suggested values for a field based on current selections
export const getSuggestionsForField = (
  field: string,
  currentData: Partial<PromptWizardData>
): string[] => {
  const suggestions: Record<string, string[]> = {
    lighting: ["golden hour", "soft natural", "dramatic", "studio"],
    mood: ["serene", "luxurious", "energetic", "mysterious"],
    scene: [
      "luxury hotel lobby",
      "beach club",
      "coffee shop",
      "rooftop terrace",
      "art gallery",
    ],
    materials: ["silk", "linen", "cashmere", "cotton", "leather"],
    accessories: [
      "gold jewelry",
      "designer bag",
      "sunglasses",
      "watch",
      "minimal jewelry",
    ],
  };

  return suggestions[field] || [];
};

