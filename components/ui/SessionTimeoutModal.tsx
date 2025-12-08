"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { hapticMedium } from "@/lib/utils/haptics";

interface SessionTimeoutModalProps {
  show: boolean;
  timeRemaining: number | null;
  onExtend: () => void;
}

export default function SessionTimeoutModal({
  show,
  timeRemaining,
  onExtend,
}: SessionTimeoutModalProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleExtend = () => {
    hapticMedium();
    onExtend();
  };

  const handleLogout = async () => {
    hapticMedium();
    await signOut();
    router.push("/auth");
  };

  const seconds = timeRemaining ? Math.ceil(timeRemaining / 1000) : 0;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleExtend}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-champagne"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-champagne/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-champagne-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="heading-luxury text-xl text-mocha-dark mb-2">
                  Session Expiring Soon
                </h3>
                <p className="body-luxury text-sm text-mocha-light mb-4">
                  Your session will expire in{" "}
                  <span className="font-bold text-champagne-dark text-lg">
                    {seconds}
                  </span>{" "}
                  seconds
                </p>
                <p className="body-luxury text-xs text-mocha-light">
                  Click "Stay Logged In" to continue your session
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExtend}
                  className="w-full py-3 bg-champagne text-white rounded-xl font-medium touch-target hover:bg-champagne-dark transition-colors shadow-lg"
                  style={{ backgroundColor: "#D4AF37", color: "#FFFFFF" }}
                >
                  Stay Logged In
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 border-2 border-stone-300 text-mocha-dark rounded-xl font-medium touch-target hover:bg-stone-50 transition-colors"
                  style={{ color: "#1C1917" }}
                >
                  Log Out Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

