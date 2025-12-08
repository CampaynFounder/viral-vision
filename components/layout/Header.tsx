"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { hapticLight } from "@/lib/utils/haptics";
import CreditCounter from "@/components/ui/CreditCounter";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { initializeUserCredits } from "@/lib/utils/credits-manager";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [credits, setCredits] = useState(50);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [userTier, setUserTier] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    // Use credits manager to properly initialize credits
    const userCredits = initializeUserCredits(user?.id || null);
    setCredits(userCredits.isUnlimited ? 999 : userCredits.credits);
    setIsUnlimited(userCredits.isUnlimited);
    setUserTier(userCredits.userTier);
    
    // Listen for credit and tier updates (when user navigates between pages)
    const handleStorageChange = () => {
      // Re-initialize credits to ensure accuracy
      const userCredits = initializeUserCredits(user?.id || null);
      setCredits(userCredits.isUnlimited ? 999 : userCredits.credits);
      setIsUnlimited(userCredits.isUnlimited);
      setUserTier(userCredits.userTier);
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also check on focus (for same-tab updates)
    window.addEventListener("focus", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [pathname]); // Re-check when route changes

  // Handle video playback on first login
  useEffect(() => {
    if (!user || !videoRef.current) return;

    // Check if video has been played this session
    const sessionKey = `logoVideoPlayed_${user.id}`;
    const hasPlayedThisSession = sessionStorage.getItem(sessionKey) === "true";

    const video = videoRef.current;

    if (!hasPlayedThisSession) {
      // Play video on first login
      const playVideo = () => {
        video.play().catch((error) => {
          console.error("Error playing logo video:", error);
        });
      };

      // Wait for video to be ready
      if (video.readyState >= 2) {
        // Video is already loaded
        playVideo();
      } else {
        // Wait for video to load
        video.addEventListener("loadeddata", playVideo, { once: true });
      }
      
      // Mark as played in sessionStorage
      sessionStorage.setItem(sessionKey, "true");
      setHasPlayed(true);
    } else {
      // Video already played, keep it paused at the end
      const seekToEnd = () => {
        if (video.duration) {
          video.currentTime = video.duration;
          video.pause();
        }
      };

      if (video.readyState >= 2 && video.duration) {
        // Video is already loaded
        seekToEnd();
      } else {
        // Wait for video to load
        video.addEventListener("loadedmetadata", seekToEnd, { once: true });
      }
      setHasPlayed(true);
    }
  }, [user]);

  // Reset video state on logout
  useEffect(() => {
    if (!user && videoRef.current) {
      // User logged out, clear all logo video session keys
      // Clear all session keys that start with "logoVideoPlayed_"
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("logoVideoPlayed_")) {
          sessionStorage.removeItem(key);
        }
      });
      setHasPlayed(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
      }
    }
  }, [user]);

  const isHome = pathname === "/";
  const isCheckout = pathname === "/checkout";
  const isAuth = pathname === "/auth";

  if (isHome || isCheckout || isAuth) {
    return null; // Don't show header on landing, checkout, or auth
  }

  return (
    <header 
      className="sticky top-0 z-30 border-b border-stone-200 relative overflow-hidden"
      style={{
        backgroundImage: user ? 'url(/header-background.png)' : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for text contrast - only show when logged in with background */}
      {user && (
        <div 
          className="absolute inset-0 bg-alabaster/85 backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(250, 249, 246, 0.85)', // alabaster with opacity
          }}
        />
      )}
      <div className="max-w-7xl mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo/Home */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticLight();
              router.push("/");
            }}
            className="touch-target relative"
            style={{ height: '40px', width: 'auto', minWidth: '120px' }}
          >
            <video
              ref={videoRef}
              src="/vvs-logo.mp4"
              className="h-full w-auto object-contain"
              playsInline
              muted
              loop={false}
              preload="auto"
              style={{
                maxHeight: '40px',
                width: 'auto',
                objectFit: 'contain',
              }}
              onEnded={() => {
                // Keep video at the end frame (static)
                if (videoRef.current) {
                  videoRef.current.pause();
                }
              }}
            />
          </motion.button>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            <button
              onClick={() => {
                hapticLight();
                router.push("/generate");
              }}
              className={`body-luxury text-sm touch-target transition-colors font-semibold ${
                pathname.startsWith("/generate")
                  ? "text-champagne"
                  : "text-mocha-dark hover:text-champagne"
              }`}
              style={
                pathname.startsWith("/generate")
                  ? { color: '#D4AF37', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                  : { color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }
              }
            >
              Generator
            </button>
            <button
              onClick={() => {
                hapticLight();
                router.push("/dashboard");
              }}
              className={`body-luxury text-sm touch-target transition-colors font-semibold ${
                pathname === "/dashboard"
                  ? "text-champagne"
                  : "text-mocha-dark hover:text-champagne"
              }`}
              style={
                pathname === "/dashboard"
                  ? { color: '#D4AF37', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                  : { color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }
              }
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                hapticLight();
                router.push("/portfolio");
              }}
              className={`body-luxury text-sm touch-target transition-colors font-semibold ${
                pathname === "/portfolio"
                  ? "text-champagne"
                  : "text-mocha-dark hover:text-champagne"
              }`}
              style={
                pathname === "/portfolio"
                  ? { color: '#D4AF37', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                  : { color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }
              }
            >
              Portfolio
            </button>
            <button
              onClick={() => {
                hapticLight();
                router.push("/profile");
              }}
              className={`body-luxury text-sm touch-target transition-colors font-semibold ${
                pathname === "/profile"
                  ? "text-champagne"
                  : "text-mocha-dark hover:text-champagne"
              }`}
              style={
                pathname === "/profile"
                  ? { color: '#D4AF37', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                  : { color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }
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
                <span 
                  className="text-sm font-semibold"
                  style={{ color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
                >
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
        <nav className="sm:hidden flex items-center justify-between mt-4 pt-4 border-t border-stone-200/50">
          <button
            onClick={() => {
              hapticLight();
              router.push("/generate");
            }}
            className={`body-luxury text-xs touch-target font-semibold ${
              pathname.startsWith("/generate") ? "text-champagne" : "text-mocha-dark"
            }`}
            style={
              pathname.startsWith("/generate")
                ? { color: '#D4AF37', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                : { color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }
            }
          >
            Generate
          </button>
          <button
            onClick={() => {
              hapticLight();
              router.push("/portfolio");
            }}
            className={`body-luxury text-xs touch-target font-semibold ${
              pathname === "/portfolio" ? "text-champagne" : "text-mocha-dark"
            }`}
            style={
              pathname === "/portfolio"
                ? { color: '#D4AF37', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                : { color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }
            }
          >
            Portfolio
          </button>
          <button
            onClick={() => {
              hapticLight();
              router.push("/profile");
            }}
            className={`body-luxury text-xs touch-target font-semibold ${
              pathname === "/profile" ? "text-champagne" : "text-mocha-dark"
            }`}
            style={
              pathname === "/profile"
                ? { color: '#D4AF37', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                : { color: '#1C1917', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }
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
              className="body-luxury text-xs px-3 py-1.5 bg-champagne text-white rounded-full touch-target font-semibold shadow-md"
              style={{ 
                backgroundColor: '#D4AF37', 
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Upgrade
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

