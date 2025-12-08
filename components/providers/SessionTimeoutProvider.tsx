"use client";

import { useSessionTimeout } from "@/lib/hooks/useSessionTimeout";
import SessionTimeoutModal from "@/components/ui/SessionTimeoutModal";

export default function SessionTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showWarning, timeRemaining, extendSession } = useSessionTimeout();

  return (
    <>
      {children}
      <SessionTimeoutModal
        show={showWarning}
        timeRemaining={timeRemaining}
        onExtend={extendSession}
      />
    </>
  );
}

