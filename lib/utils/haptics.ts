// Haptic Feedback Utilities
// Provides tactile feedback for luxury feel

export const vibrate = (pattern: number | number[] = 5): void => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};

export const hapticLight = (): void => vibrate(5);
export const hapticMedium = (): void => vibrate(10);
export const hapticHeavy = (): void => vibrate(20);

