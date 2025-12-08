// Enhanced Prompt Wizard Data Structures
// Comprehensive data model for advanced prompt generation

export type ModelType = "midjourney" | "stable-diffusion" | "dalle";

export interface ModelParameters {
  midjourney?: {
    aspectRatio?: string; // "16:9", "1:1", "9:16", "4:5"
    stylize?: number; // 0-1000
    version?: string; // "6.0", "5.2", "5.1"
    style?: "raw" | "default" | "stylize";
    seed?: number;
    chaos?: number; // 0-100
    quality?: number; // 0.25, 0.5, 1, 2
  };
  stableDiffusion?: {
    cfgScale?: number; // 1-30
    steps?: number; // 1-150
    sampler?: string; // "DPM++ 2M Karras", "Euler a", etc.
    seed?: number;
    negativePrompt?: string;
  };
  dalle?: {
    style?: "vivid" | "natural";
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    quality?: "standard" | "hd";
  };
}

export interface PromptWizardData {
  // Step 1: Subject & Identity
  subject?: string; // "woman", "couple", "lifestyle", "product"
  identity?: string; // "entrepreneur", "artist", "influencer", "executive"
  ageRange?: string; // "20s", "30s", "40s", "ageless"
  ethnicity?: string; // Optional, user can skip
  
  // Subject Details (New)
  format?: "image" | "video"; // Output format
  race?: string; // "African American", "Caucasian", "Asian", "Hispanic/Latino", "Mixed", "Other", "Prefer not to say"
  skinTone?: "Dark" | "Light" | "Brown" | "Bronze"; // Skin tone specification
  hairColor?: "Black" | "Blonde" | "Burgundy" | "Neon" | "Brown" | "Red" | "Other"; // Hair color
  eyebrowEffect?: string; // Eyebrow enhancement effect
  
  // Step 2: Pose & Body Language
  pose?: string[]; // ["relaxed", "confident", "elegant", "dynamic"]
  bodyLanguage?: string; // "leaning forward", "arms crossed", "open posture"
  gesture?: string; // "holding coffee", "typing", "pointing"
  
  // Step 3: Hair, Makeup & Accessories
  hair?: string; // "sleek bun", "beach waves", "cropped", "long straight"
  makeup?: string; // "natural", "glam", "minimal", "no-makeup"
  accessories?: string[]; // ["gold jewelry", "designer bag", "sunglasses"]
  
  // Step 4: Clothing & Materials (enhanced from current wardrobe)
  clothing?: string; // "tailored blazer", "silk dress", "athleisure set"
  materials?: string[]; // ["linen", "cashmere", "silk", "cotton"]
  fit?: string; // "oversized", "fitted", "relaxed", "tailored"
  colors?: string[]; // ["beige", "cream", "champagne"]
  
  // Step 5: Scene & Background
  scene?: string; // "luxury hotel lobby", "beach club", "coffee shop"
  background?: string; // "minimalist", "textured wall", "blurred"
  environment?: string[]; // ["indoor", "outdoor", "urban", "natural"]
  location?: string; // "Dubai", "Paris", "Hamptons", "generic"
  
  // Step 6: Lighting & Mood
  lighting?: string; // "golden hour", "soft natural", "dramatic", "studio"
  mood?: string; // "serene", "energetic", "mysterious", "luxurious"
  timeOfDay?: string; // "morning", "afternoon", "sunset", "night"
  colorTemperature?: string; // "warm", "cool", "neutral"
  
  // Step 7: Camera & Composition
  cameraAngle?: string; // "eye level", "bird's eye", "dutch angle", "low angle"
  composition?: string; // "rule of thirds", "centered", "asymmetric"
  depthOfField?: string; // "shallow", "deep focus", "bokeh"
  framing?: string; // "close-up", "medium shot", "wide shot"
  
  // Step 8: Style & Quality (enhanced from current aesthetic)
  style?: string; // aesthetic id from existing system
  quality?: string; // "photorealistic", "cinematic", "editorial", "documentary"
  filmStock?: string; // "35mm", "medium format", "digital", "film grain"
  postProcessing?: string; // "color graded", "raw", "vintage"
  
  // Step 9: Hard Constraints (Non-negotiables)
  constraints?: string[]; // ["no text", "no logos", "no people", "no hands visible"]
  mustInclude?: string[]; // ["specific brand", "color scheme", "element"]
  aspectRatio?: string; // "portrait", "landscape", "square"
  
  // Step 10: Negative Prompts (Exclusions)
  negativePrompts?: string[]; // ["blurry", "low quality", "distorted", "ugly"]
  excludeElements?: string[]; // ["text", "watermarks", "people", "animals"]
  
  // Step 11: Technical/Model Options
  model?: ModelType;
  parameters?: ModelParameters;
  
  // User's original input
  userInput?: string;
}

export interface PromptValidationResult {
  isValid: boolean;
  conflicts: Conflict[];
  suggestions: Suggestion[];
  completeness: number; // 0-100
  warnings: string[];
}

export interface Conflict {
  field1: string;
  field2: string;
  description: string;
  severity: "error" | "warning";
}

export interface Suggestion {
  field: string;
  message: string;
  type: "missing" | "conflict" | "optimization";
  action?: string;
}

export interface FormattedPrompt {
  positive: string;
  negative?: string;
  parameters?: string;
  model: ModelType;
  fullPrompt: string; // Complete ready-to-use prompt
}

