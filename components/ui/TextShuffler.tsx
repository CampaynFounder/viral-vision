"use client";

import { useState, useEffect } from "react";

interface TextShufflerProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export default function TextShuffler({
  texts,
  interval = 800,
  className = "",
}: TextShufflerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  return (
    <span className={className} key={currentIndex}>
      {texts[currentIndex]}
    </span>
  );
}

