// Model-Specific Prompt Formatters
// Converts structured prompt data into model-specific formats

import { PromptWizardData, FormattedPrompt, ModelType } from "@/lib/types/prompt-wizard";

export const formatPromptForModel = (
  data: PromptWizardData,
  model: ModelType
): FormattedPrompt => {
  switch (model) {
    case "midjourney":
      return formatForMidjourney(data);
    case "stable-diffusion":
      return formatForStableDiffusion(data);
    case "dalle":
      return formatForDalle(data);
    default:
      return formatForMidjourney(data); // Default
  }
};

const formatForMidjourney = (data: PromptWizardData): FormattedPrompt => {
  const parts: string[] = [];

  // Core subject
  if (data.subject) parts.push(data.subject);
  if (data.identity) parts.push(data.identity);

  // Pose & body language
  if (data.pose && data.pose.length > 0) {
    parts.push(data.pose.join(", "));
  }
  if (data.bodyLanguage) parts.push(data.bodyLanguage);
  if (data.gesture) parts.push(data.gesture);

  // Hair, makeup, accessories (only if not faceless or faceless allows)
  if (!data.facelessMode) {
    if (data.hair) parts.push(data.hair);
    if (data.makeup) parts.push(data.makeup);
  }
  if (data.accessories && data.accessories.length > 0) {
    parts.push(data.accessories.join(", "));
  }

  // Clothing & materials
  if (data.clothing) parts.push(data.clothing);
  if (data.materials && data.materials.length > 0) {
    parts.push(data.materials.join(", "));
  }
  if (data.fit) parts.push(`${data.fit} fit`);
  if (data.colors && data.colors.length > 0) {
    parts.push(data.colors.join(", "));
  }

  // Scene & background
  if (data.scene) parts.push(data.scene);
  if (data.background) parts.push(data.background);
  if (data.environment && data.environment.length > 0) {
    parts.push(data.environment.join(", "));
  }
  if (data.location) parts.push(data.location);

  // Lighting & mood
  if (data.lighting) parts.push(data.lighting);
  if (data.mood) parts.push(data.mood);
  if (data.timeOfDay) parts.push(data.timeOfDay);
  if (data.colorTemperature) parts.push(`${data.colorTemperature} tones`);

  // Camera & composition
  if (data.cameraAngle) parts.push(data.cameraAngle);
  if (data.composition) parts.push(data.composition);
  if (data.depthOfField) parts.push(data.depthOfField);
  if (data.framing) parts.push(data.framing);

  // Style & quality
  if (data.quality) parts.push(data.quality);
  if (data.filmStock) parts.push(`shot on ${data.filmStock}`);
  if (data.postProcessing) parts.push(data.postProcessing);

  // Faceless mode constraints
  if (data.facelessMode) {
    parts.push(
      "woman seen from behind, back of head, cropped face, focus on hands, motion blur, no direct gaze, no visible eyes, no face visible"
    );
  }

  // Build parameters
  const params: string[] = [];
  if (data.parameters?.midjourney) {
    const mj = data.parameters.midjourney;
    if (mj.aspectRatio) params.push(`--ar ${mj.aspectRatio}`);
    if (mj.stylize !== undefined) params.push(`--stylize ${mj.stylize}`);
    if (mj.version) params.push(`--v ${mj.version}`);
    if (mj.style) params.push(`--style ${mj.style}`);
    if (mj.seed) params.push(`--seed ${mj.seed}`);
    if (mj.chaos) params.push(`--chaos ${mj.chaos}`);
    if (mj.quality) params.push(`--quality ${mj.quality}`);
  } else {
    // Default Midjourney params based on aesthetic
    params.push("--v 6.0");
    if (data.style === "old-money") {
      params.push("--stylize 250 --style raw");
    }
  }

  const positive = parts.join(", ");
  const parameters = params.join(" ");
  const fullPrompt = `${positive} ${parameters}`.trim();

  return {
    positive,
    negative: data.negativePrompts?.join(", ") || undefined,
    parameters,
    model: "midjourney",
    fullPrompt,
  };
};

const formatForStableDiffusion = (data: PromptWizardData): FormattedPrompt => {
  // Similar structure but different formatting
  const parts: string[] = [];

  // Build positive prompt (similar to Midjourney but with SD-specific keywords)
  if (data.subject) parts.push(data.subject);
  if (data.identity) parts.push(data.identity);
  if (data.pose && data.pose.length > 0) parts.push(data.pose.join(", "));
  if (data.clothing) parts.push(data.clothing);
  if (data.materials && data.materials.length > 0) parts.push(data.materials.join(", "));
  if (data.scene) parts.push(data.scene);
  if (data.lighting) parts.push(data.lighting);
  if (data.mood) parts.push(data.mood);
  if (data.cameraAngle) parts.push(data.cameraAngle);
  if (data.quality) parts.push(data.quality);

  // SD quality tags
  parts.push("high quality, detailed, professional photography");

  // Faceless mode
  if (data.facelessMode) {
    parts.push("woman from behind, back of head, no face visible");
  }

  const positive = parts.join(", ");
  const negative = [
    ...(data.negativePrompts || []),
    "blurry, low quality, distorted, ugly, bad anatomy",
  ].join(", ");

  // Build parameters string
  const params: string[] = [];
  if (data.parameters?.stableDiffusion) {
    const sd = data.parameters.stableDiffusion;
    if (sd.cfgScale) params.push(`CFG Scale: ${sd.cfgScale}`);
    if (sd.steps) params.push(`Steps: ${sd.steps}`);
    if (sd.sampler) params.push(`Sampler: ${sd.sampler}`);
    if (sd.seed) params.push(`Seed: ${sd.seed}`);
  }

  const fullPrompt = `${positive}\n\nNegative: ${negative}`;

  return {
    positive,
    negative,
    parameters: params.join(", "),
    model: "stable-diffusion",
    fullPrompt,
  };
};

const formatForDalle = (data: PromptWizardData): FormattedPrompt => {
  // DALL·E prefers more natural language
  const parts: string[] = [];

  // Build natural language prompt
  if (data.subject && data.identity) {
    parts.push(`A ${data.identity} ${data.subject}`);
  } else if (data.subject) {
    parts.push(data.subject);
  }

  if (data.pose && data.pose.length > 0) {
    parts.push(`in a ${data.pose[0]} pose`);
  }

  if (data.clothing) parts.push(`wearing ${data.clothing}`);
  if (data.materials && data.materials.length > 0) {
    parts.push(`made of ${data.materials.join(" and ")}`);
  }

  if (data.scene) parts.push(`in a ${data.scene}`);
  if (data.lighting) parts.push(`with ${data.lighting} lighting`);
  if (data.mood) parts.push(`conveying a ${data.mood} mood`);

  if (data.facelessMode) {
    parts.push("seen from behind, face not visible");
  }

  // DALL·E quality descriptors
  parts.push("high quality, professional photography, detailed");

  const positive = parts.join(", ");
  const fullPrompt = positive;

  return {
    positive,
    model: "dalle",
    fullPrompt,
  };
};

// Get default parameters for a model based on aesthetic
export const getDefaultParameters = (
  model: ModelType,
  aesthetic?: string
): PromptWizardData["parameters"] => {
  const defaults: Record<ModelType, PromptWizardData["parameters"]> = {
    midjourney: {
      midjourney: {
        version: "6.0",
        stylize: 250,
        style: "raw",
        aspectRatio: "4:5", // Instagram-friendly default
      },
    },
    "stable-diffusion": {
      stableDiffusion: {
        cfgScale: 7,
        steps: 30,
        sampler: "DPM++ 2M Karras",
      },
    },
    dalle: {
      dalle: {
        style: "natural",
        size: "1024x1024",
        quality: "hd",
      },
    },
  };

  const params = defaults[model];

  // Adjust based on aesthetic
  if (model === "midjourney" && params?.midjourney) {
    if (aesthetic === "old-money") {
      params.midjourney.stylize = 250;
      params.midjourney.style = "raw";
    } else if (aesthetic === "clean-girl") {
      params.midjourney.stylize = 200;
    } else if (aesthetic === "dark-feminine") {
      params.midjourney.stylize = 300;
    }
  }

  return params;
};

