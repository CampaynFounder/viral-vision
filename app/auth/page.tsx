"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { hapticMedium } from "@/lib/utils/haptics";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    hapticMedium();

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setMessage(
            "Check your email for the confirmation link! We've sent you a verification email."
          );
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          router.push("/generate");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-alabaster flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-stone-200"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-luxury text-3xl text-mocha mb-2">
              {mode === "signup" ? "Create Your Account" : "Welcome Back"}
            </h1>
            <p className="text-mocha-light">
              {mode === "signup"
                ? "Start generating viral content prompts"
                : "Sign in to continue"}
            </p>
          </div>

          {/* Toggle Mode */}
          <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
                hapticMedium();
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors touch-target ${
                mode === "signup"
                  ? "bg-champagne text-white"
                  : "text-mocha-light hover:text-mocha"
              }`}
              style={
                mode === "signup"
                  ? { backgroundColor: "#D4AF37", color: "#FFFFFF" }
                  : {}
              }
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setMode("signin");
                setError(null);
                setMessage(null);
                hapticMedium();
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors touch-target ${
                mode === "signin"
                  ? "bg-champagne text-white"
                  : "text-mocha-light hover:text-mocha"
              }`}
              style={
                mode === "signin"
                  ? { backgroundColor: "#D4AF37", color: "#FFFFFF" }
                  : {}
              }
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-mocha mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-champagne focus:outline-none transition-colors liquid-gold"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-mocha mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-champagne focus:outline-none transition-colors liquid-gold"
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-champagne text-white rounded-xl font-semibold touch-target hover:bg-champagne-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#D4AF37", color: "#FFFFFF" }}
            >
              {loading
                ? mode === "signup"
                  ? "Creating Account..."
                  : "Signing In..."
                : mode === "signup"
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-mocha-light">
            {mode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setMessage(null);
                    hapticMedium();
                  }}
                  className="text-champagne hover:text-champagne-dark font-medium"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                    hapticMedium();
                  }}
                  className="text-champagne hover:text-champagne-dark font-medium"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

