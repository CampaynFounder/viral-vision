/**
 * Usage Tracker for Profitability Monitoring
 * 
 * Tracks prompt generation for both credit-based and unlimited users
 * This allows us to monitor costs vs revenue for profitability analysis
 */

export interface UsageRecord {
  timestamp: string;
  userId: string;
  isUnlimited: boolean;
  creditCost: number; // What it would have cost (for unlimited users)
  model: string;
  aesthetic?: string;
  hasAdvancedOptions: boolean;
}

/**
 * Track a prompt generation
 * This is called every time a user generates a prompt, regardless of subscription
 */
export function trackPromptGeneration(
  userId: string,
  isUnlimited: boolean,
  creditCost: number,
  model: string,
  aesthetic?: string,
  hasAdvancedOptions: boolean = false
): void {
  if (typeof window === 'undefined') return;

  const record: UsageRecord = {
    timestamp: new Date().toISOString(),
    userId,
    isUnlimited,
    creditCost,
    model,
    aesthetic,
    hasAdvancedOptions,
  };

  // Store in localStorage (Phase 2: Move to Supabase)
  const usageHistory = getUsageHistory();
  usageHistory.push(record);
  
  // Keep last 1000 records
  const trimmed = usageHistory.slice(-1000);
  localStorage.setItem('usageHistory', JSON.stringify(trimmed));

  // Update unlimited user stats
  if (isUnlimited) {
    updateUnlimitedStats(userId, creditCost);
  }
}

/**
 * Get usage history
 */
export function getUsageHistory(): UsageRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('usageHistory');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get unlimited user statistics
 */
export function getUnlimitedUserStats(userId: string): {
  totalPrompts: number;
  totalCreditValue: number; // Total credits that would have been used
  averageCostPerPrompt: number;
  promptsThisMonth: number;
  promptsThisWeek: number;
} {
  if (typeof window === 'undefined') {
    return {
      totalPrompts: 0,
      totalCreditValue: 0,
      averageCostPerPrompt: 0,
      promptsThisMonth: 0,
      promptsThisWeek: 0,
    };
  }

  const history = getUsageHistory();
  const userHistory = history.filter(r => r.userId === userId && r.isUnlimited);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const promptsThisMonth = userHistory.filter(
    r => new Date(r.timestamp) >= monthStart
  ).length;

  const promptsThisWeek = userHistory.filter(
    r => new Date(r.timestamp) >= weekStart
  ).length;

  const totalPrompts = userHistory.length;
  const totalCreditValue = userHistory.reduce((sum, r) => sum + r.creditCost, 0);
  const averageCostPerPrompt = totalPrompts > 0 ? totalCreditValue / totalPrompts : 0;

  return {
    totalPrompts,
    totalCreditValue,
    averageCostPerPrompt: Math.round(averageCostPerPrompt * 100) / 100,
    promptsThisMonth,
    promptsThisWeek,
  };
}

/**
 * Update unlimited user stats in localStorage
 */
function updateUnlimitedStats(userId: string, creditCost: number): void {
  if (typeof window === 'undefined') return;

  const statsKey = `unlimitedStats_${userId}`;
  const existing = localStorage.getItem(statsKey);
  const stats = existing ? JSON.parse(existing) : {
    totalPrompts: 0,
    totalCreditValue: 0,
    lastUpdated: new Date().toISOString(),
  };

  stats.totalPrompts += 1;
  stats.totalCreditValue += creditCost;
  stats.lastUpdated = new Date().toISOString();

  localStorage.setItem(statsKey, JSON.stringify(stats));
}

/**
 * Get profitability metrics for unlimited users
 * This helps determine if subscription pricing is sustainable
 */
export function getProfitabilityMetrics(): {
  totalUnlimitedUsers: number;
  totalUnlimitedPrompts: number;
  totalCreditValue: number;
  averagePromptsPerUser: number;
  averageCostPerPrompt: number;
  estimatedMonthlyRevenue: number; // $47/month per user
  estimatedMonthlyCost: number; // Based on OpenAI API costs
} {
  if (typeof window === 'undefined') {
    return {
      totalUnlimitedUsers: 0,
      totalUnlimitedPrompts: 0,
      totalCreditValue: 0,
      averagePromptsPerUser: 0,
      averageCostPerPrompt: 0,
      estimatedMonthlyRevenue: 0,
      estimatedMonthlyCost: 0,
    };
  }

  const history = getUsageHistory();
  const unlimitedHistory = history.filter(r => r.isUnlimited);
  
  const uniqueUsers = new Set(unlimitedHistory.map(r => r.userId));
  const totalUnlimitedUsers = uniqueUsers.size;
  const totalUnlimitedPrompts = unlimitedHistory.length;
  const totalCreditValue = unlimitedHistory.reduce((sum, r) => sum + r.creditCost, 0);
  
  const averagePromptsPerUser = totalUnlimitedUsers > 0 
    ? totalUnlimitedPrompts / totalUnlimitedUsers 
    : 0;
  
  const averageCostPerPrompt = totalUnlimitedPrompts > 0
    ? totalCreditValue / totalUnlimitedPrompts
    : 0;

  // Estimate costs (Phase 2: Use actual OpenAI API costs)
  // Assuming ~$0.01 per prompt on average
  const estimatedCostPerPrompt = 0.01;
  const estimatedMonthlyCost = totalUnlimitedPrompts * estimatedCostPerPrompt;
  
  // $47/month per unlimited subscriber
  const estimatedMonthlyRevenue = totalUnlimitedUsers * 47;

  return {
    totalUnlimitedUsers,
    totalUnlimitedPrompts,
    totalCreditValue,
    averagePromptsPerUser: Math.round(averagePromptsPerUser * 100) / 100,
    averageCostPerPrompt: Math.round(averageCostPerPrompt * 100) / 100,
    estimatedMonthlyRevenue,
    estimatedMonthlyCost: Math.round(estimatedMonthlyCost * 100) / 100,
  };
}

