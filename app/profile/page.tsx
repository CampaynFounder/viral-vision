"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { motion } from "framer-motion";
import { hapticMedium, hapticLight } from "@/lib/utils/haptics";
import { supabase } from "@/lib/supabase/client";
import { getUnlimitedUserStats } from "@/lib/utils/usage-tracker";
import { initializeUserCredits } from "@/lib/utils/credits-manager";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(50);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [unlimitedStats, setUnlimitedStats] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    // Load user data
    setEmail(user.email || "");
    
    // Load credits and stats using credits manager from Supabase
    const loadCredits = async () => {
      const userCredits = await initializeUserCredits(user?.id || null);
      setCredits(userCredits.isUnlimited ? Infinity : userCredits.credits);
      setSubscriptionStatus(userCredits.subscriptionStatus);
      
      // Load unlimited user stats if subscribed
      if (userCredits.subscriptionStatus === "active" && user?.id) {
        const stats = getUnlimitedUserStats(user.id);
        setUnlimitedStats(stats);
      }
    };
    
    loadCredits();
    
    const storedGenerations = localStorage.getItem("totalGenerations");
    
    if (storedGenerations) {
      setTotalGenerations(parseInt(storedGenerations, 10));
    }

    // Phase 2: Load display name from Supabase
    // For now, extract from email
    if (user.email) {
      const nameFromEmail = user.email.split("@")[0];
      setDisplayName(nameFromEmail);
    }
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    hapticMedium();

    try {
      // Phase 2: Update user profile in Supabase
      // For now, just update localStorage
      localStorage.setItem("displayName", displayName);
      
      setMessage("Profile updated successfully!");
      
      // Phase 2: Update Supabase
      // const { error: updateError } = await supabase
      //   .from('users')
      //   .update({ display_name: displayName })
      //   .eq('id', user?.id);
      
      // if (updateError) throw updateError;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    hapticMedium();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) throw resetError;

      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-alabaster p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-luxury text-2xl sm:text-3xl text-mocha mb-6 sm:mb-8">
          Your Profile
        </h1>

        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border-2 border-stone-200 mb-6"
        >
          <h2 className="heading-luxury text-xl text-mocha mb-4">Account Information</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-mocha mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl bg-stone-50 text-mocha-light cursor-not-allowed"
              />
              <p className="text-xs text-mocha-light mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-mocha mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-champagne focus:outline-none transition-colors"
              />
              <p className="text-xs text-mocha-light mt-1">
                This is how your name appears in the app
              </p>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm"
              >
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-champagne text-white rounded-xl font-semibold touch-target hover:bg-champagne-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              style={{ backgroundColor: '#D4AF37', color: '#FFFFFF', maxWidth: '100%' }}
            >
              <span className="truncate block">{loading ? "Updating..." : "Update Profile"}</span>
            </button>
          </form>
        </motion.div>

        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border-2 border-stone-200 mb-6"
        >
          <h2 className="heading-luxury text-xl text-mocha mb-4">Password</h2>
          <p className="text-sm text-mocha-light mb-4">
            Change your password by clicking the button below. We'll send you a reset link.
          </p>
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full py-3 border-2 border-stone-200 text-mocha-dark rounded-xl font-semibold touch-target hover:border-champagne hover:text-champagne transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            style={{ maxWidth: '100%' }}
          >
            <span className="truncate block">Change Password</span>
          </button>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border-2 border-stone-200 mb-6"
        >
          <h2 className="heading-luxury text-xl text-mocha mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-xs text-mocha-light mb-1">Credits</p>
              <p className="heading-luxury text-2xl text-champagne">
                {credits === Infinity ? "∞" : credits}
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-xs text-mocha-light mb-1">Generations</p>
              <p className="heading-luxury text-2xl text-mocha">{totalGenerations}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-xs text-mocha-light mb-1">Subscription</p>
              <p className="heading-luxury text-lg text-mocha">
                {subscriptionStatus === "active" ? "Active" : "None"}
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-xs text-mocha-light mb-1">Member Since</p>
              <p className="heading-luxury text-lg text-mocha">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently"}
              </p>
            </div>
          </div>

          {/* Unlimited User Stats */}
          {subscriptionStatus === "active" && unlimitedStats && (
            <div className="mt-6 pt-6 border-t border-stone-200">
              <h3 className="heading-luxury text-lg text-mocha mb-4">Unlimited Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-champagne/10 rounded-xl">
                  <p className="text-xs text-mocha-light mb-1">This Month</p>
                  <p className="heading-luxury text-xl text-champagne">
                    {unlimitedStats.promptsThisMonth}
                  </p>
                </div>
                <div className="p-4 bg-champagne/10 rounded-xl">
                  <p className="text-xs text-mocha-light mb-1">This Week</p>
                  <p className="heading-luxury text-xl text-champagne">
                    {unlimitedStats.promptsThisWeek}
                  </p>
                </div>
                <div className="p-4 bg-champagne/10 rounded-xl">
                  <p className="text-xs text-mocha-light mb-1">Total Prompts</p>
                  <p className="heading-luxury text-xl text-champagne">
                    {unlimitedStats.totalPrompts}
                  </p>
                </div>
                <div className="p-4 bg-champagne/10 rounded-xl">
                  <p className="text-xs text-mocha-light mb-1">Avg Cost/Prompt</p>
                  <p className="heading-luxury text-xl text-champagne">
                    {unlimitedStats.averageCostPerPrompt}
                  </p>
                </div>
              </div>
              <p className="text-xs text-mocha-light mt-4 text-center">
                Total credit value used: {unlimitedStats.totalCreditValue} credits
              </p>
            </div>
          )}
        </motion.div>

        {/* Logout Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border-2 border-stone-200"
        >
          <h2 className="heading-luxury text-xl text-mocha mb-4">Account Actions</h2>
          <p className="text-sm text-mocha-light mb-4">
            Sign out of your account. You can sign back in anytime.
          </p>
          <button
            onClick={async () => {
              hapticMedium();
              await signOut();
              router.push("/");
            }}
            className="w-full py-3 border-2 border-stone-200 text-mocha-dark rounded-xl font-semibold touch-target hover:border-champagne hover:text-champagne transition-colors overflow-hidden"
            style={{ maxWidth: '100%' }}
          >
            <span className="truncate block">Sign Out</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

