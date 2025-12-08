// Enhanced Prompt Engine V2
// Advanced prompt generation with structured data and model-specific formatting

import { PromptWizardData, FormattedPrompt, ModelType } from "@/lib/types/prompt-wizard";
import { formatPromptForModel, getDefaultParameters } from "./model-formatters";
import { validatePrompt } from "./prompt-validator";
import { Aesthetic } from "@/lib/constants/aesthetics";

export interface EnhancedPromptInput extends Partial<PromptWizardData> {
  userInput?: string;
  aesthetic?: Aesthetic;
}

export const generateEnhancedPrompt = (
  input: EnhancedPromptInput,
  model: ModelType = "midjourney"
): {
  prompt: FormattedPrompt;
  validation: ReturnType<typeof validatePrompt>;
  suggestions: string[];
} => {
  // Build structured data
  const wizardData: PromptWizardData = {
    userInput: input.userInput,
    model,
    ...input,
  };

  // Apply aesthetic defaults if provided
  if (input.aesthetic) {
    wizardData.style = input.aesthetic.id;
    if (!wizardData.parameters) {
      wizardData.parameters = getDefaultParameters(model, input.aesthetic.id);
    }
  }

  // Validate prompt
  const validation = validatePrompt(wizardData);

  // Format for selected model
  const prompt = formatPromptForModel(wizardData, model);

  // Generate suggestions
  const suggestions = generateSuggestions(wizardData, validation);

  return {
    prompt,
    validation,
    suggestions,
  };
};

const generateSuggestions = (
  data: PromptWizardData,
  validation: ReturnType<typeof validatePrompt>
): string[] => {
  const suggestions: string[] = [];

  // Add validation suggestions
  validation.suggestions.forEach((s) => {
    if (s.action) {
      suggestions.push(s.action);
    }
  });

  // Add optimization suggestions based on completeness
  if (validation.completeness < 70) {
    suggestions.push("Add more details to improve prompt quality");
  }

  if (!data.negativePrompts || data.negativePrompts.length === 0) {
    suggestions.push("Consider adding negative prompts for better results");
  }

  return suggestions;
};

// Convert old format to new format (for backward compatibility)
export const convertLegacyInput = (
  input: {
    userInput: string;
    aesthetic?: Aesthetic;
    shotType?: { keywords: string[] };
    wardrobe?: { keywords: string[] };
  }
): EnhancedPromptInput => {
  return {
    userInput: input.userInput,
    aesthetic: input.aesthetic,
    pose: input.shotType?.keywords,
    clothing: input.wardrobe?.keywords.join(", "),
  };
};

