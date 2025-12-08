/**
 * Non-Linear Credit Deduction Calculator
 * 
 * This implements a value-based pricing model that:
 * - Hooks users with cheap early generations
 * - Increases cost as they use premium features
 * - Creates urgency when credits get low
 * - Drives conversions to subscription
 */

export interface GenerationSelections {
  aesthetic?: { id: string; isPremium?: boolean };
  shotType?: { id: string };
  wardrobe?: { id: string };
  model?: 'midjourney' | 'stable-diffusion' | 'dalle';
  advancedOptions?: {
    lighting?: boolean;
    scene?: boolean;
    cameraAngle?: boolean;
    negativePrompts?: boolean;
    customParameters?: boolean;
  };
  totalGenerations?: number; // User's lifetime generation count
}

export interface CreditCostBreakdown {
  baseCost: number;
  featureCost: number;
  advancedCost: number;
  modelMultiplier: number;
  complexityMultiplier: number;
  generationMultiplier: number; // Increases cost over time
  totalCost: number;
  breakdown: string[];
}

/**
 * Calculate credit cost based on selections
 * Uses non-linear pricing to drive conversions
 */
export function calculateCreditCost(
  selections: GenerationSelections
): CreditCostBreakdown {
  const breakdown: string[] = [];
  
  // Base cost - First prompt costs 10 credits (to encourage bonus claim), subsequent prompts use normal pricing
  const isFirstPrompt = (selections.totalGenerations || 0) === 0;
  let baseCost = isFirstPrompt ? 10 : 1;
  if (isFirstPrompt) {
    breakdown.push(`First prompt: ${baseCost} credits (special pricing)`);
  } else {
    breakdown.push(`Base generation: ${baseCost} credit`);
  }
  
  // Feature costs (additive)
  let featureCost = 0;
  if (selections.aesthetic) {
    const aestheticCost = selections.aesthetic.isPremium ? 2 : 1;
    featureCost += aestheticCost;
    breakdown.push(
      `Aesthetic (${selections.aesthetic.isPremium ? 'Premium' : 'Standard'}): +${aestheticCost} credits`
    );
  }
  if (selections.shotType) {
    featureCost += 1;
    breakdown.push(`Shot type: +1 credit`);
  }
  if (selections.wardrobe) {
    featureCost += 1;
    breakdown.push(`Wardrobe: +1 credit`);
  }
  
  // Advanced options (exponential cost)
  const advancedOptions = selections.advancedOptions || {};
  const advancedOptionsCount = Object.values(advancedOptions).filter(Boolean).length;
  let advancedCost = 0;
  
  if (advancedOptionsCount > 0) {
    // Exponential: 1 option = 1 credit, 2 = 2.5, 3 = 4.75, 4 = 8.125
    advancedCost = Math.pow(1.5, advancedOptionsCount) - 1;
    advancedCost = Math.ceil(advancedCost);
    breakdown.push(`Advanced options (${advancedOptionsCount}): +${advancedCost} credits`);
  }
  
  // Model premium multiplier
  let modelMultiplier = 1;
  if (selections.model === 'midjourney') {
    modelMultiplier = 2;
    breakdown.push(`Midjourney model: 2x multiplier`);
  } else if (selections.model === 'dalle') {
    modelMultiplier = 1.5;
    breakdown.push(`DALL·E model: 1.5x multiplier`);
  }
  
  // Complexity multiplier (based on total features used)
  const totalFeatures = (selections.aesthetic ? 1 : 0) +
                       (selections.shotType ? 1 : 0) +
                       (selections.wardrobe ? 1 : 0) +
                       advancedOptionsCount;
  const complexityMultiplier = 1 + (totalFeatures * 0.05); // 5% per feature
  if (complexityMultiplier > 1) {
    breakdown.push(`Complexity bonus: ${((complexityMultiplier - 1) * 100).toFixed(0)}%`);
  }
  
  // Generation multiplier (increases cost over time to drive conversion)
  // First 5: 1x, 6-15: 1.5x, 16-30: 2x, 31+: 2.5x
  const totalGenerations = selections.totalGenerations || 0;
  let generationMultiplier = 1;
  if (totalGenerations >= 31) {
    generationMultiplier = 2.5;
    breakdown.push(`Premium user tier: 2.5x multiplier`);
  } else if (totalGenerations >= 16) {
    generationMultiplier = 2.0;
    breakdown.push(`Advanced user tier: 2x multiplier`);
  } else if (totalGenerations >= 6) {
    generationMultiplier = 1.5;
    breakdown.push(`Engaged user tier: 1.5x multiplier`);
  }
  
  // Calculate total cost
  const subtotal = baseCost + featureCost + advancedCost;
  const totalCost = Math.ceil(
    subtotal * modelMultiplier * complexityMultiplier * generationMultiplier
  );
  
  // Cap at 10 credits per generation (prevents abuse)
  const finalCost = Math.min(totalCost, 10);
  
  return {
    baseCost,
    featureCost,
    advancedCost,
    modelMultiplier,
    complexityMultiplier,
    generationMultiplier,
    totalCost: finalCost,
    breakdown,
  };
}

/**
 * Get user's total generation count from Supabase
 * (For Phase 2 - currently returns localStorage value)
 */
export async function getUserGenerationCount(userId: string): Promise<number> {
  // Phase 2: Query Supabase for user's prompt count
  // For now, use localStorage
  if (typeof window !== 'undefined') {
    const count = localStorage.getItem('totalGenerations');
    return count ? parseInt(count, 10) : 0;
  }
  return 0;
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(
  currentCredits: number,
  cost: number,
  isUnlimited: boolean = false
): boolean {
  if (isUnlimited) return true;
  return currentCredits >= cost;
}

/**
 * Get conversion urgency message based on credits and cost
 */
export function getConversionMessage(
  currentCredits: number,
  cost: number,
  totalGenerations: number
): string | null {
  if (currentCredits <= 0) {
    return "You're out of credits! Subscribe for unlimited access.";
  }
  
  if (currentCredits <= cost) {
    return `This will use your last ${currentCredits} credits. Subscribe to continue!`;
  }
  
  const remainingAfter = currentCredits - cost;
  
  if (remainingAfter <= 5) {
    return `Only ${remainingAfter} credits left after this. Upgrade now!`;
  }
  
  if (remainingAfter <= 10 && totalGenerations >= 15) {
    return "You're getting premium results! Subscribe for unlimited access.";
  }
  
  if (totalGenerations >= 30 && currentCredits <= 20) {
    return "You're a power user! Subscribe to save on every generation.";
  }
  
  return null;
}

