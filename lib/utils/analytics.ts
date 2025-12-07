// Analytics Utilities
// Placeholder for GA4 and conversion tracking

// GA4 Measurement ID placeholder
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "";

// Initialize GA4 (to be called in root layout)
export const initGA4 = () => {
  if (typeof window === "undefined" || !GA4_MEASUREMENT_ID) return;

  // Phase 2: Initialize GA4 script
  // This will be implemented when GA4 ID is available
  if (!(window as any).gtag) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA4_MEASUREMENT_ID);
  }
};

// Event tracking functions
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  (window as any).gtag("event", eventName, {
    event_category: "engagement",
    ...eventParams,
  });
};

// Conversion tracking
export const trackConversion = (value: number, currency: string = "USD") => {
  trackEvent("purchase", {
    value,
    currency,
  });
};

// Specific event trackers
export const trackPromptGeneration = () => {
  trackEvent("generate_prompt", {
    event_category: "content",
  });
};

export const trackCheckoutStart = (productId: string, price: number) => {
  trackEvent("begin_checkout", {
    event_category: "ecommerce",
    product_id: productId,
    value: price,
    currency: "USD",
  });
};

export const trackPurchase = (productId: string, price: number) => {
  trackConversion(price);
  trackEvent("purchase", {
    event_category: "ecommerce",
    product_id: productId,
    value: price,
    currency: "USD",
  });
};

export const trackCopyPrompt = () => {
  trackEvent("copy_prompt", {
    event_category: "engagement",
  });
};

export const trackExportPortfolio = (count: number) => {
  trackEvent("export_portfolio", {
    event_category: "engagement",
    item_count: count,
  });
};

