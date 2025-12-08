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

// Cache to prevent redundant database calls
const creditsCache = new Map<string, { data: UserCredits; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds - increased to prevent flooding during generation
const pendingRequests = new Map<string, Promise<UserCredits>>(); // Track in-flight requests

/**
 * Initialize credits for a user on first login
 * Fetches from Supabase first, then falls back to localStorage
 * Uses caching to prevent redundant database calls
 */
export async function initializeUserCredits(userId: string | null): Promise<UserCredits> {
  // Check cache first
  const cacheKey = userId || "anonymous";
  const cached = creditsCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  // Check if there's already a pending request for this user
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }
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
      const result = {
        credits: 999, // Display value for unlimited
        isUnlimited: true,
        userTier: tier,
        subscriptionStatus: "active" as const,
      };
      creditsCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    }

    if (stored && stored !== "unlimited" && !isNaN(parseInt(stored, 10))) {
      const result = {
        credits: parseInt(stored, 10),
        isUnlimited: false,
        userTier: tier,
        subscriptionStatus: "none" as const,
      };
      creditsCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    }

    creditsCache.set(cacheKey, { data: defaultCredits, timestamp: now });
    return defaultCredits;
  }

  // Authenticated user - ALWAYS fetch from Supabase (database is source of truth)
  // Create a promise for this request to prevent duplicate calls
  const fetchPromise = (async () => {
    try {
      // Check for active subscription (database source of truth)
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subscription && !subError) {
        // User has unlimited subscription - database is source of truth
        // Cache in localStorage for offline/performance, but DB is authoritative
        localStorage.setItem("subscription", "active");
        localStorage.setItem("userTier", subscription.plan_id);
        localStorage.setItem("credits", "unlimited");
        
        const result = {
          credits: 999, // Display value for unlimited
          isUnlimited: true,
          userTier: subscription.plan_id,
          subscriptionStatus: "active" as const,
        };
        
        // Update cache
        creditsCache.set(cacheKey, { data: result, timestamp: Date.now() });
        
        return result;
      }

      // Get total credits from database (SUM of all credit transactions)
      // Database is source of truth - calculate from credits table
      const { data: creditRecords, error: creditError } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', userId);

      if (creditError) {
        console.error("Error fetching credits from database:", creditError);
        // If database query fails, throw error - don't fall back to localStorage
        throw new Error(`Failed to fetch credits from database: ${creditError.message}`);
      }

      // Calculate total from database transactions (source of truth)
      const totalCredits = creditRecords?.reduce((sum, record) => sum + record.amount, 0) || 0;
      
      // Cache in localStorage for performance, but DB is authoritative
      localStorage.setItem("credits", totalCredits.toString());
      
      // Get user tier from most recent purchase (database source of truth)
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

      const result = {
        credits: totalCredits,
        isUnlimited: false,
        userTier: recentPayment?.product_id || null,
        subscriptionStatus: "none" as const,
      };
      
      // Update cache
      creditsCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error("Error fetching credits from Supabase:", error);
      // For authenticated users, we MUST have database access
      // If database is unavailable, return error state rather than stale localStorage
      const errorResult = {
        credits: 0,
        isUnlimited: false,
        userTier: null,
        subscriptionStatus: "none" as const,
      };
      
      // Don't cache error results
      return errorResult;
    } finally {
      // Remove from pending requests once complete
      pendingRequests.delete(cacheKey);
    }
  })();
  
  // Store the pending request
  pendingRequests.set(cacheKey, fetchPromise);
  
  return fetchPromise;
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
 * Get total credits from Supabase (Database is source of truth)
 * Sums all credit entries for a user from the credits table
 * 
 * @param userId - User ID to fetch credits for
 * @returns Total credits (or 999 for unlimited, or 0 if error)
 */
export async function getTotalCreditsFromDB(userId: string): Promise<number> {
  try {
    // First check for active subscription (unlimited access)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (subscription) {
      // User has unlimited subscription - database is source of truth
      return 999; // Display value for unlimited
    }
    
    // Query Supabase credits table - database is source of truth
    // Calculate total by summing all credit transactions
    const { data, error } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching credits from database:", error);
      // Don't fall back to localStorage - database is source of truth
      // Return 0 if database query fails
      return 0;
    }
    
    // Calculate total from database transactions (source of truth)
    const total = data?.reduce((sum, record) => sum + record.amount, 0) || 0;
    
    return total;
  } catch (error) {
    console.error("Error getting credits from DB:", error);
    // Database is source of truth - return 0 if we can't fetch
    return 0;
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
        } else {
          // Clear cache so next fetch gets fresh data
          clearCreditsCache(userId);
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
          // Clear cache so next fetch gets fresh data
          clearCreditsCache(userId);
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
  
  // Clear cache so next fetch gets fresh data
  clearCreditsCache(userId);
  
  // Phase 2: Record in Supabase
  // if (userId) {
  //   await supabase.from('credits').insert({
  //     user_id: userId,
  //     amount: 5,
  //     source: 'first_time_bonus',
  //   });
  //   clearCreditsCache(userId);
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

/**
 * Clear the credits cache for a specific user
 * This forces the next call to initializeUserCredits to fetch fresh data from the database
 */
export function clearCreditsCache(userId: string | null): void {
  const cacheKey = userId || "anonymous";
  creditsCache.delete(cacheKey);
  pendingRequests.delete(cacheKey);
}

