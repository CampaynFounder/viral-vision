// Prompt Engineering Logic
// Concatenates user input with aesthetic rules

import { Aesthetic, ShotType, Wardrobe } from "@/lib/constants/aesthetics";

export interface PromptGenerationInput {
  userInput: string;
  aesthetic?: Aesthetic;
  shotType?: ShotType;
  wardrobe?: Wardrobe;
}

export const generatePrompt = (input: PromptGenerationInput): string => {
  let prompt = input.userInput;

  // Add aesthetic keywords
  if (input.aesthetic) {
    prompt += `, ${input.aesthetic.keywords.join(", ")}`;
  }

  // Add shot type keywords
  if (input.shotType) {
    prompt += `, ${input.shotType.keywords.join(", ")}`;
  }

  // Add wardrobe keywords
  if (input.wardrobe) {
    prompt += `, ${input.wardrobe.keywords.join(", ")}`;
  }

  // Add Midjourney parameters if aesthetic is selected
  if (input.aesthetic?.midjourneyParams) {
    prompt += ` ${input.aesthetic.midjourneyParams}`;
  }

  return prompt.trim();
};

export const generateViralHooks = (prompt: string): string[] => {
  // Mock viral hooks - will be replaced with AI in Phase 2
  return [
    `POV: You finally stopped trading time for money...`,
    `When you realize 9-5 wasn't the vibe...`,
    `Plot twist: You built this in your spare time...`,
  ];
};

export const generateAudioSuggestion = (prompt: string): string => {
  // Mock audio suggestion - will be replaced with AI in Phase 2
  return "Just a Girl - No Doubt";
};

