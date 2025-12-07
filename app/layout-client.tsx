"use client";

import { useEffect } from "react";
import { initGA4 } from "@/lib/utils/analytics";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize analytics
    initGA4();
  }, []);

  return <>{children}</>;
}

