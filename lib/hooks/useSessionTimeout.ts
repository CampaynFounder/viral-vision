"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

const SESSION_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
const WARNING_TIME_MS = 30 * 1000; // 30 seconds before timeout
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
  "click",
] as const;

export function useSessionTimeout() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isActiveRef = useRef<boolean>(true);

  const resetTimeout = useCallback(() => {
    if (!user || !isActiveRef.current) return;

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset last activity time
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setTimeRemaining(null);

    // Set warning timeout (30 seconds before session expires)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      const remaining = SESSION_TIMEOUT_MS - WARNING_TIME_MS;
      setTimeRemaining(remaining);
    }, SESSION_TIMEOUT_MS - WARNING_TIME_MS);

    // Set logout timeout
    timeoutRef.current = setTimeout(async () => {
      if (user) {
        await signOut();
        router.push("/auth");
      }
    }, SESSION_TIMEOUT_MS);
  }, [user, signOut, router]);

  const handleActivity = useCallback(() => {
    if (!user || !isActiveRef.current) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only reset if there was actual activity (not just rapid events)
    if (timeSinceLastActivity > 1000) {
      resetTimeout();
    }
  }, [user, resetTimeout]);

  const extendSession = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    if (!user) {
      // Clear timeouts if user logs out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      setShowWarning(false);
      setTimeRemaining(null);
      return;
    }

    // Initialize timeout on mount
    resetTimeout();

    // Add activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Update countdown when warning is shown
    let countdownInterval: NodeJS.Timeout | null = null;
    if (showWarning) {
      countdownInterval = setInterval(() => {
        const elapsed = Date.now() - (lastActivityRef.current + SESSION_TIMEOUT_MS - WARNING_TIME_MS);
        const remaining = WARNING_TIME_MS - elapsed;
        if (remaining > 0) {
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(0);
        }
      }, 100);
    }

    return () => {
      // Cleanup
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [user, showWarning, handleActivity, resetTimeout]);

  // Pause timeout when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
      } else {
        isActiveRef.current = true;
        resetTimeout();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resetTimeout]);

  return {
    showWarning,
    timeRemaining,
    extendSession,
  };
}

