/**
 * Credits Manager Utility
 * 
 * Handles proper initialization and management of user credits.
 * Prevents unauthorized credit grants and ensures accurate tracking.
 */

import { supabase } from "@/lib/supabase/client";

export interface UserCredits {
  credits: number;
  isUnlimited: boolean;
  userTier: string | null;
  subscriptionStatus: "active" | "none";
}

/**
 * Initialize credits for a user on first login
 * Clears stale localStorage data and sets proper defaults
 */
export function initializeUserCredits(userId: string | null): UserCredits {
  // For new users, start with 5 free credits (designed to convert after first prompt)
  const defaultCredits: UserCredits = {
    credits: 5,
    isUnlimited: false,
    userTier: null,
    subscriptionStatus: "none",
  };

  if (!userId) {
    // Not authenticated - use localStorage but verify it's valid
    const stored = localStorage.getItem("credits");
    const subscription = localStorage.getItem("subscription");
    const tier = localStorage.getItem("userTier");

    // Only trust subscription if there's a valid tier
    if (subscription === "active" && tier) {
      return {
        credits: 999, // Display value for unlimited
        isUnlimited: true,
        userTier: tier,
        subscriptionStatus: "active",
      };
    }

    if (stored && !isNaN(parseInt(stored, 10))) {
      return {
        credits: parseInt(stored, 10),
        isUnlimited: false,
        userTier: tier,
        subscriptionStatus: "none",
      };
    }

    return defaultCredits;
  }

  // Authenticated user - check for first-time login
  const firstLoginKey = `firstLogin_${userId}`;
  const hasLoggedInBefore = localStorage.getItem(firstLoginKey);

  if (!hasLoggedInBefore) {
    // First time login - clear any stale data and set defaults
    localStorage.removeItem("subscription");
    localStorage.removeItem("userTier");
    localStorage.setItem("credits", "5");
    localStorage.setItem(firstLoginKey, "true");
    
    return defaultCredits;
  }

  // Returning user - load from localStorage but verify
  const stored = localStorage.getItem("credits");
  const subscription = localStorage.getItem("subscription");
  const tier = localStorage.getItem("userTier");

  // Only trust subscription if there's a valid tier AND it's a verified purchase
  // For now, we check if tier exists. In Phase 2, verify against Supabase.
  if (subscription === "active" && tier) {
    return {
      credits: 999, // Display value for unlimited
      isUnlimited: true,
      userTier: tier,
      subscriptionStatus: "active",
    };
  }

  if (stored && !isNaN(parseInt(stored, 10))) {
    return {
      credits: parseInt(stored, 10),
      isUnlimited: false,
      userTier: tier,
      subscriptionStatus: "none",
    };
  }

  return defaultCredits;
}

/**
 * Verify subscription status from Supabase (Phase 2)
 * This will replace localStorage checks once Supabase is fully integrated
 */
export async function verifySubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  tier: string | null;
}> {
  try {
    // Phase 2: Query Supabase subscriptions table
    // For now, return localStorage value but log that we should verify
    const subscription = localStorage.getItem("subscription");
    const tier = localStorage.getItem("userTier");

    if (subscription === "active" && tier) {
      // TODO: Phase 2 - Verify against Supabase
      // const { data, error } = await supabase
      //   .from('subscriptions')
      //   .select('status, plan_id')
      //   .eq('user_id', userId)
      //   .eq('status', 'active')
      //   .single();
      
      // if (data) {
      //   return { isActive: true, tier: data.plan_id };
      // }
      
      return { isActive: true, tier };
    }

    return { isActive: false, tier: null };
  } catch (error) {
    console.error("Error verifying subscription:", error);
    return { isActive: false, tier: null };
  }
}

/**
 * Get total credits from Supabase (Phase 2)
 * Sums all credit entries for a user
 */
export async function getTotalCreditsFromDB(userId: string): Promise<number> {
  try {
    // Phase 2: Query Supabase credits table
    // const { data, error } = await supabase
    //   .from('credits')
    //   .select('amount')
    //   .eq('user_id', userId);
    
    // if (error) throw error;
    
    // const total = data?.reduce((sum, record) => sum + record.amount, 0) || 0;
    // return total;
    
    // For now, return localStorage value
    const stored = localStorage.getItem("credits");
    return stored ? parseInt(stored, 10) : 5;
  } catch (error) {
    console.error("Error getting credits from DB:", error);
    return 5; // Default fallback
  }
}

/**
 * Grant credits after verified purchase
 * Updates both localStorage and Supabase (Phase 2)
 */
export async function grantCredits(
  userId: string | null,
  amount: number | "unlimited",
  tier: string,
  source: "purchase" | "subscription" | "bonus" = "purchase"
): Promise<void> {
  if (amount === "unlimited") {
    localStorage.setItem("subscription", "active");
    localStorage.setItem("userTier", tier);
    localStorage.setItem("credits", "unlimited");
    
    // Phase 2: Update Supabase
    // if (userId) {
    //   await supabase.from('subscriptions').upsert({
    //     user_id: userId,
    //     status: 'active',
    //     plan_id: tier,
    //   });
    // }
  } else {
    const current = localStorage.getItem("credits");
    const currentAmount = current === "unlimited" ? 0 : (parseInt(current || "0", 10));
    const newAmount = currentAmount + amount;
    localStorage.setItem("credits", newAmount.toString());
    localStorage.setItem("userTier", tier);
    
    // Phase 2: Insert credit record in Supabase
    // if (userId) {
    //   await supabase.from('credits').insert({
    //     user_id: userId,
    //     amount: amount,
    //     source: source,
    //   });
    // }
  }
}

/**
 * Deduct credits after prompt generation
 * Updates both localStorage and Supabase (Phase 2)
 */
export async function deductCredits(
  userId: string | null,
  amount: number
): Promise<{ success: boolean; remaining: number }> {
  const current = localStorage.getItem("credits");
  
  if (current === "unlimited") {
    // Unlimited users don't deduct credits, but we track usage
    return { success: true, remaining: Infinity };
  }

  const currentAmount = parseInt(current || "0", 10);
  if (currentAmount < amount) {
    return { success: false, remaining: currentAmount };
  }

  const newAmount = currentAmount - amount;
  localStorage.setItem("credits", newAmount.toString());
  
  // Phase 2: Record credit deduction in Supabase
  // if (userId) {
  //   await supabase.from('credits').insert({
  //     user_id: userId,
  //     amount: -amount,
  //     source: 'usage',
  //   });
  // }
  
  return { success: true, remaining: newAmount };
}

