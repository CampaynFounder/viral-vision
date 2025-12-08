// Prompt Validation & Conflict Detection
// Detects conflicts, missing elements, and provides optimization suggestions

import { PromptWizardData, Conflict, Suggestion, PromptValidationResult } from "@/lib/types/prompt-wizard";

export const validatePrompt = (data: Partial<PromptWizardData>): PromptValidationResult => {
  const conflicts: Conflict[] = [];
  const suggestions: Suggestion[] = [];
  const warnings: string[] = [];
  let completeness = 0;

  // Check for conflicts
  conflicts.push(...detectConflicts(data));

  // Check for missing critical elements
  suggestions.push(...detectMissingElements(data));

  // Calculate completeness
  completeness = calculateCompleteness(data);

  // Generate warnings
  warnings.push(...generateWarnings(data));

  return {
    isValid: conflicts.filter((c) => c.severity === "error").length === 0,
    conflicts,
    suggestions,
    completeness,
    warnings,
  };
};

const detectConflicts = (data: Partial<PromptWizardData>): Conflict[] => {
  const conflicts: Conflict[] = [];

  // Check hair length conflicts
  if (data.hair?.includes("long") && data.hair?.includes("short")) {
    conflicts.push({
      field1: "hair",
      field2: "hair",
      description: "Cannot have both long and short hair",
      severity: "error",
    });
  }

  // Check lighting/mood conflicts
  if (data.lighting === "dramatic" && data.mood === "serene") {
    conflicts.push({
      field1: "lighting",
      field2: "mood",
      description: "Dramatic lighting typically pairs better with powerful or mysterious moods",
      severity: "warning",
    });
  }

  // Check time of day conflicts
  if (data.timeOfDay === "night" && data.lighting?.includes("golden hour")) {
    conflicts.push({
      field1: "timeOfDay",
      field2: "lighting",
      description: "Golden hour occurs at sunrise/sunset, not at night",
      severity: "error",
    });
  }

  // Check material/style conflicts
  if (data.materials?.includes("linen") && data.style === "y2k") {
    conflicts.push({
      field1: "materials",
      field2: "style",
      description: "Linen is more Old Money aesthetic, Y2K typically uses synthetic materials",
      severity: "warning",
    });
  }


  return conflicts;
};

const detectMissingElements = (data: Partial<PromptWizardData>): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // Check for missing scene/background
  if (!data.scene && !data.background) {
    suggestions.push({
      field: "scene",
      message: "Adding a scene or background will improve prompt quality",
      type: "missing",
      action: "Add scene or background",
    });
  }

  // Check for missing lighting
  if (!data.lighting) {
    suggestions.push({
      field: "lighting",
      message: "Lighting is crucial for mood and quality",
      type: "missing",
      action: "Select lighting type",
    });
  }

  // Check for missing composition details
  if (!data.cameraAngle && !data.composition) {
    suggestions.push({
      field: "cameraAngle",
      message: "Camera angle helps define the shot style",
      type: "missing",
      action: "Select camera angle",
    });
  }

  // Check for missing quality/style
  if (!data.quality && !data.style) {
    suggestions.push({
      field: "quality",
      message: "Quality setting ensures consistent output",
      type: "missing",
      action: "Select quality level",
    });
  }

  return suggestions;
};

const calculateCompleteness = (data: Partial<PromptWizardData>): number => {
  const fields = [
    "subject",
    "scene",
    "lighting",
    "mood",
    "cameraAngle",
    "quality",
    "style",
    "clothing",
    "pose",
  ];

  const filledFields = fields.filter((field) => {
    const value = data[field as keyof PromptWizardData];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  }).length;

  return Math.round((filledFields / fields.length) * 100);
};

const generateWarnings = (data: Partial<PromptWizardData>): string[] => {
  const warnings: string[] = [];

  // Too many elements
  const totalElements =
    (data.materials?.length || 0) +
    (data.accessories?.length || 0) +
    (data.pose?.length || 0);

  if (totalElements > 8) {
    warnings.push("Too many elements may dilute the focus. Consider simplifying.");
  }


  // No model selected
  if (!data.model) {
    warnings.push("Selecting a model will optimize the prompt format");
  }

  return warnings;
};

// Get optimization suggestions
export const getOptimizationSuggestions = (
  data: Partial<PromptWizardData>
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // Suggest adding depth of field for close-ups
  if (data.framing === "close-up" && !data.depthOfField) {
    suggestions.push({
      field: "depthOfField",
      message: "Shallow depth of field works great for close-ups",
      type: "optimization",
      action: "Add depth of field",
    });
  }

  // Suggest materials based on scene
  if (data.scene?.includes("beach") && !data.materials?.includes("linen")) {
    suggestions.push({
      field: "materials",
      message: "Linen works well for beach scenes",
      type: "optimization",
      action: "Add linen to materials",
    });
  }

  return suggestions;
};

