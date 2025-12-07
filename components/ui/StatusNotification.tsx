"use client";

import { motion, AnimatePresence } from "framer-motion";

export type StatusType = "thinking" | "manifesting" | "finding" | "optimizing" | "finalizing";

interface StatusNotificationProps {
  status: StatusType | null;
  message?: string;
  className?: string;
}

const statusMessages: Record<StatusType, string> = {
  thinking: "Thinking...",
  manifesting: "Manifesting your vision...",
  finding: "Glowing Up...",
  optimizing: "Optimizing for viral potential...",
  finalizing: "Finalizing your prompt...",
};

export default function StatusNotification({
  status,
  message,
  className = "",
}: StatusNotificationProps) {
  const displayMessage = message || (status ? statusMessages[status] : "");

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`bg-champagne/10 border-2 border-champagne/30 rounded-xl p-4 ${className}`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-champagne border-t-transparent rounded-full"
            />
            <p className="text-sm text-mocha-dark font-medium">{displayMessage}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

