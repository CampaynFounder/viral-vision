// Sanity Check System
// LLM-powered validation to catch logical errors and improve prompt quality
// Phase 2: Will integrate with OpenAI API

import { PromptWizardData, FormattedPrompt } from "@/lib/types/prompt-wizard";

export interface SanityCheckResult {
  passed: boolean;
  issues: SanityIssue[];
  suggestions: string[];
  confidence: number; // 0-100
}

export interface SanityIssue {
  type: "logical" | "aesthetic" | "technical" | "conflict";
  severity: "error" | "warning" | "info";
  message: string;
  field?: string;
  fix?: string;
}

// Mock sanity check (Phase 2: Replace with actual LLM call)
export const runSanityCheck = async (
  data: PromptWizardData,
  formattedPrompt: FormattedPrompt
): Promise<SanityCheckResult> => {
  // Phase 2: This will call OpenAI API
  // const response = await fetch("/api/sanity-check", {
  //   method: "POST",
  //   body: JSON.stringify({ data, prompt: formattedPrompt }),
  // });
  // return response.json();

  // Mock implementation for Phase 1
  const issues: SanityIssue[] = [];
  const suggestions: string[] = [];

  // Basic logical checks

  if (data.timeOfDay === "night" && data.lighting?.includes("golden hour")) {
    issues.push({
      type: "logical",
      severity: "error",
      message: "Golden hour occurs at sunrise/sunset, not at night",
      field: "timeOfDay",
      fix: "Change time of day or lighting",
    });
  }

  // Aesthetic consistency checks
  if (data.style === "old-money" && data.materials?.includes("synthetic")) {
    issues.push({
      type: "aesthetic",
      severity: "warning",
      message: "Old Money aesthetic typically uses natural materials (linen, silk, cashmere)",
      field: "materials",
      fix: "Use natural materials for Old Money aesthetic",
    });
  }

  // Technical checks
  if (data.model === "midjourney" && !formattedPrompt.parameters) {
    issues.push({
      type: "technical",
      severity: "info",
      message: "Midjourney prompts benefit from explicit parameters",
      field: "parameters",
      fix: "Add Midjourney parameters (--v, --stylize, etc.)",
    });
  }

  // Generate suggestions based on completeness
  if (!data.scene && !data.background) {
    suggestions.push("Adding a scene or background will improve prompt quality");
  }

  if (!data.lighting) {
    suggestions.push("Lighting is crucial for mood and quality");
  }

  const passed = issues.filter((i) => i.severity === "error").length === 0;
  const confidence = passed ? 85 : 60; // Mock confidence score

  return {
    passed,
    issues,
    suggestions,
    confidence,
  };
};

// Phase 2: Actual LLM integration
export const runLLMSanityCheck = async (
  data: PromptWizardData,
  formattedPrompt: FormattedPrompt
): Promise<SanityCheckResult> => {
  // This will be implemented in Phase 2 with OpenAI API
  // The prompt will be:
  // "Analyze this image generation prompt for logical errors, aesthetic inconsistencies,
  //  and technical issues. Return a structured analysis with issues and suggestions."
  
  throw new Error("LLM sanity check not implemented yet (Phase 2)");
};

