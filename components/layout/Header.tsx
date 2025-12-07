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

  useEffect(() => {
    const stored = localStorage.getItem("credits");
    const subscription = localStorage.getItem("subscription");
    if (subscription === "active") {
      setCredits(999);
      setIsUnlimited(true);
    } else if (stored) {
      setCredits(parseInt(stored, 10));
    }
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
                router.push("/checkout");
              }}
              className="body-luxury text-sm px-4 py-2 bg-champagne text-white rounded-full touch-target hover:bg-champagne-dark transition-colors"
            >
              Upgrade
            </button>
          </nav>

          {/* User Info & Credits */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-mocha-light">
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={async () => {
                    hapticLight();
                    await signOut();
                    router.push("/");
                  }}
                  className="text-xs text-mocha-light hover:text-mocha touch-target"
                >
                  Sign Out
                </button>
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
            className={`body-luxury text-xs touch-target ${
              pathname.startsWith("/generate") ? "text-champagne" : "text-mocha"
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => {
              hapticLight();
              router.push("/portfolio");
            }}
            className={`body-luxury text-xs touch-target ${
              pathname === "/portfolio" ? "text-champagne" : "text-mocha"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => {
              hapticLight();
              router.push("/checkout");
            }}
            className="body-luxury text-xs px-3 py-1.5 bg-champagne text-white rounded-full touch-target"
          >
            Upgrade
          </button>
        </nav>
      </div>
    </header>
  );
}

