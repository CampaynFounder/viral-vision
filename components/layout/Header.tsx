"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { hapticLight } from "@/lib/utils/haptics";
import CreditCounter from "@/components/ui/CreditCounter";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [credits, setCredits] = useState(50);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [userTier, setUserTier] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("credits");
    const subscription = localStorage.getItem("subscription");
    let tier = localStorage.getItem("userTier");
    
    // If subscription is active but no tier is set, assume CEO Access
    if (subscription === "active" && !tier) {
      tier = "ceo-access";
      localStorage.setItem("userTier", "ceo-access");
    }
    
    setUserTier(tier);
    
    if (subscription === "active") {
      setCredits(999);
      setIsUnlimited(true);
    } else if (stored) {
      setCredits(parseInt(stored, 10));
    } else {
      // New user - default to 50 credits
      setCredits(50);
    }
    
    // Listen for credit and tier updates (when user navigates between pages)
    const handleStorageChange = () => {
      const updated = localStorage.getItem("credits");
      const updatedTier = localStorage.getItem("userTier");
      const updatedSubscription = localStorage.getItem("subscription");
      
      if (updated) {
        setCredits(parseInt(updated, 10));
      }
      
      // Update tier if changed
      if (updatedTier) {
        setUserTier(updatedTier);
      }
      
      // If subscription is active, set tier to CEO Access
      if (updatedSubscription === "active" && !updatedTier) {
        setUserTier("ceo-access");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also check on focus (for same-tab updates)
    window.addEventListener("focus", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [pathname]); // Re-check when route changes

  const isHome = pathname === "/";
  const isCheckout = pathname === "/checkout";
  const isAuth = pathname === "/auth";

  if (isHome || isCheckout || isAuth) {
    return null; // Don't show header on landing, checkout, or auth
  }

  return (
    <header className="sticky top-0 z-30 bg-alabaster/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Home */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticLight();
              router.push("/");
            }}
            className="heading-luxury text-xl text-champagne touch-target"
          >
            Viral Vision
          </motion.button>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            <button
              onClick={() => {
                hapticLight();
                router.push("/generate");
              }}
              className={`body-luxury text-sm touch-target transition-colors ${
                pathname.startsWith("/generate")
                  ? "text-champagne"
                  : "text-mocha hover:text-champagne"
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => {
                hapticLight();
                router.push("/dashboard");
              }}
              className={`body-luxury text-sm touch-target transition-colors ${
                pathname === "/dashboard"
                  ? "text-champagne"
                  : "text-mocha hover:text-champagne"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                hapticLight();
                router.push("/portfolio");
              }}
              className={`body-luxury text-sm touch-target transition-colors ${
                pathname === "/portfolio"
                  ? "text-champagne"
                  : "text-mocha hover:text-champagne"
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => {
                hapticLight();
                router.push("/profile");
              }}
              className={`body-luxury text-sm touch-target transition-colors font-medium ${
                pathname === "/profile"
                  ? "text-champagne font-semibold"
                  : "text-mocha hover:text-champagne"
              }`}
              style={
                pathname === "/profile"
                  ? { color: '#D4AF37' }
                  : { color: '#6B5A42' }
              }
            >
              Profile
            </button>
            {/* Show Upgrade button only for non-subscribers and viral-starter users */}
            {userTier !== "ceo-access" && userTier !== "empire-bundle" && (
              <button
                onClick={() => {
                  hapticLight();
                  router.push("/checkout");
                }}
                className="body-luxury text-sm px-4 py-2 bg-champagne text-white rounded-full touch-target hover:bg-champagne-dark transition-colors overflow-hidden"
                style={{ backgroundColor: '#D4AF37', color: '#FFFFFF', maxWidth: '100%' }}
              >
                <span className="truncate block">Upgrade</span>
              </button>
            )}
          </nav>

          {/* User Info & Credits */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-mocha font-medium">
                  {user.email?.split("@")[0]}
                </span>
              </div>
            )}
            <CreditCounter
              credits={credits}
              isUnlimited={isUnlimited}
              className="sm:ml-4"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="sm:hidden flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
          <button
            onClick={() => {
              hapticLight();
              router.push("/generate");
            }}
            className={`body-luxury text-xs touch-target font-medium ${
              pathname.startsWith("/generate") ? "text-champagne" : "text-mocha"
            }`}
            style={
              pathname.startsWith("/generate")
                ? { color: '#D4AF37' }
                : { color: '#6B5A42' }
            }
          >
            Generate
          </button>
          <button
            onClick={() => {
              hapticLight();
              router.push("/portfolio");
            }}
            className={`body-luxury text-xs touch-target font-medium ${
              pathname === "/portfolio" ? "text-champagne" : "text-mocha"
            }`}
            style={
              pathname === "/portfolio"
                ? { color: '#D4AF37' }
                : { color: '#6B5A42' }
            }
          >
            Portfolio
          </button>
          <button
            onClick={() => {
              hapticLight();
              router.push("/profile");
            }}
            className={`body-luxury text-xs touch-target font-medium ${
              pathname === "/profile" ? "text-champagne" : "text-mocha"
            }`}
            style={
              pathname === "/profile"
                ? { color: '#D4AF37' }
                : { color: '#6B5A42' }
            }
          >
            Profile
          </button>
          {/* Show Upgrade button only for non-subscribers and viral-starter users */}
          {userTier !== "ceo-access" && userTier !== "empire-bundle" && (
            <button
              onClick={() => {
                hapticLight();
                router.push("/checkout");
              }}
              className="body-luxury text-xs px-3 py-1.5 bg-champagne text-white rounded-full touch-target"
              style={{ backgroundColor: '#D4AF37', color: '#FFFFFF' }}
            >
              Upgrade
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

