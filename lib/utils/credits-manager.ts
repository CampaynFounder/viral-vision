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
 * Fetches from Supabase first, then falls back to localStorage
 */
export async function initializeUserCredits(userId: string | null): Promise<UserCredits> {
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

    if (stored && stored !== "unlimited" && !isNaN(parseInt(stored, 10))) {
      return {
        credits: parseInt(stored, 10),
        isUnlimited: false,
        userTier: tier,
        subscriptionStatus: "none",
      };
    }

    return defaultCredits;
  }

  // Authenticated user - fetch from Supabase first
  try {
    // Check for active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subscription) {
      // User has unlimited subscription
      localStorage.setItem("subscription", "active");
      localStorage.setItem("userTier", subscription.plan_id);
      localStorage.setItem("credits", "unlimited");
      
      return {
        credits: 999, // Display value for unlimited
        isUnlimited: true,
        userTier: subscription.plan_id,
        subscriptionStatus: "active",
      };
    }

    // Get total credits from database
    const { data: creditRecords, error: creditError } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', userId);

    if (!creditError && creditRecords) {
      const totalCredits = creditRecords.reduce((sum, record) => sum + record.amount, 0);
      
      // Sync to localStorage
      localStorage.setItem("credits", totalCredits.toString());
      
      // Get user tier from most recent purchase
      const { data: recentPayment } = await supabase
        .from('payments')
        .select('product_id')
        .eq('user_id', userId)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentPayment) {
        localStorage.setItem("userTier", recentPayment.product_id);
      }

      return {
        credits: totalCredits,
        isUnlimited: false,
        userTier: recentPayment?.product_id || null,
        subscriptionStatus: "none",
      };
    }
  } catch (error) {
    console.error("Error fetching credits from Supabase:", error);
    // Fall through to localStorage fallback
  }

  // Fallback to localStorage if Supabase fails or no records found
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

  // Returning user - load from localStorage
  const stored = localStorage.getItem("credits");
  const subscription = localStorage.getItem("subscription");
  const tier = localStorage.getItem("userTier");

  if (subscription === "active" && tier) {
    return {
      credits: 999, // Display value for unlimited
      isUnlimited: true,
      userTier: tier,
      subscriptionStatus: "active",
    };
  }

  if (stored && stored !== "unlimited" && !isNaN(parseInt(stored, 10))) {
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
 * Get total credits from Supabase
 * Sums all credit entries for a user
 */
export async function getTotalCreditsFromDB(userId: string): Promise<number> {
  try {
    // Query Supabase credits table
    const { data, error } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching credits from Supabase:", error);
      // Fallback to localStorage
      const stored = localStorage.getItem("credits");
      return stored && stored !== "unlimited" ? parseInt(stored, 10) : 5;
    }
    
    const total = data?.reduce((sum, record) => sum + record.amount, 0) || 0;
    
    // Also check for active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (subscription) {
      // User has unlimited subscription
      return 999; // Display value for unlimited
    }
    
    return total;
  } catch (error) {
    console.error("Error getting credits from DB:", error);
    // Fallback to localStorage
    const stored = localStorage.getItem("credits");
    return stored && stored !== "unlimited" ? parseInt(stored, 10) : 5;
  }
}

/**
 * Grant credits after verified purchase
 * Updates both localStorage and Supabase
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
    
    // Update Supabase
    if (userId) {
      try {
        // Update subscription in Supabase
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: null, // Will be set by webhook
            status: 'active',
            plan_id: tier,
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Will be set by webhook
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
        
        if (subError) {
          console.error("Error updating subscription in Supabase:", subError);
        }
      } catch (error) {
        console.error("Error granting unlimited credits:", error);
      }
    }
  } else {
    const current = localStorage.getItem("credits");
    const currentAmount = current === "unlimited" ? 0 : (parseInt(current || "0", 10));
    const newAmount = currentAmount + amount;
    localStorage.setItem("credits", newAmount.toString());
    localStorage.setItem("userTier", tier);
    
    // Insert credit record in Supabase
    if (userId) {
      try {
        const { error: creditError } = await supabase
          .from('credits')
          .insert({
            user_id: userId,
            amount: amount,
            source: source,
          });
        
        if (creditError) {
          console.error("Error inserting credits in Supabase:", creditError);
          // Still update localStorage even if Supabase fails
        } else {
          console.log(`✅ Granted ${amount} credits to user ${userId} (source: ${source})`);
        }
      } catch (error) {
        console.error("Error granting credits:", error);
        // Still update localStorage even if Supabase fails
      }
    }
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

/**
 * Check if user has received first-time bonus
 */
export function hasReceivedFirstTimeBonus(userId: string | null): boolean {
  if (!userId) {
    return localStorage.getItem("firstTimeBonusReceived_anonymous") === "true";
  }
  return localStorage.getItem(`firstTimeBonusReceived_${userId}`) === "true";
}

/**
 * Grant first-time bonus credits (5 credits)
 * This is a one-time gift for new users to complete their first prompt
 */
export async function grantFirstTimeBonus(userId: string | null): Promise<void> {
  const bonusKey = userId 
    ? `firstTimeBonusReceived_${userId}` 
    : "firstTimeBonusReceived_anonymous";
  
  // Mark as received
  localStorage.setItem(bonusKey, "true");
  
  // Grant 5 credits
  const current = localStorage.getItem("credits");
  const currentAmount = current === "unlimited" ? 0 : parseInt(current || "0", 10);
  const newAmount = currentAmount + 5;
  localStorage.setItem("credits", newAmount.toString());
  
  // Phase 2: Record in Supabase
  // if (userId) {
  //   await supabase.from('credits').insert({
  //     user_id: userId,
  //     amount: 5,
  //     source: 'first_time_bonus',
  //   });
  // }
}

/**
 * Check if user is eligible for first-time bonus
 * Requirements:
 * - Has not received bonus before
 * - Is on their first prompt (totalGenerations === 0)
 * - Does not have enough credits for the current generation
 */
export function isEligibleForFirstTimeBonus(
  userId: string | null,
  currentCredits: number,
  requiredCredits: number,
  totalGenerations: number
): boolean {
  // Already received bonus
  if (hasReceivedFirstTimeBonus(userId)) {
    return false;
  }
  
  // Not first prompt
  if (totalGenerations > 0) {
    return false;
  }
  
  // Has enough credits already
  if (currentCredits >= requiredCredits) {
    return false;
  }
  
  // Needs exactly 5 more credits (bonus amount)
  const creditsNeeded = requiredCredits - currentCredits;
  if (creditsNeeded > 5) {
    return false; // Needs more than bonus can provide
  }
  
  return true;
}

