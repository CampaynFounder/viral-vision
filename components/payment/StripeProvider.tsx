"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ReactNode } from "react";

// SECURITY: Only use publishable key (pk_*) on client-side
// NEVER use secret key (sk_*) in client-side code
const getStripeKey = () => {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
  
  // Security check: Ensure we're not accidentally using a secret key
  if (key && key.startsWith('sk_')) {
    console.error('SECURITY ERROR: Secret key detected in publishable key! Use pk_* key instead.');
    return null; // Don't use secret key on client
  }
  
  return key;
};

const stripePromise = getStripeKey() ? loadStripe(getStripeKey()!) : null;

interface StripeProviderProps {
  children: ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  // If Stripe key is not configured, show a message
  // But still wrap in Elements with null stripe to prevent hook errors
  if (!stripePromise) {
    return (
      <div className="py-4">
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl mb-4">
          <p className="text-sm text-yellow-800">
            Stripe is not configured yet. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
          </p>
        </div>
        <Elements stripe={null}>
          {children}
        </Elements>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#D4AF37", // champagne
            colorBackground: "#FFFFFF", // white for card input
            colorText: "#1C1917", // Very dark for maximum contrast
            colorTextSecondary: "#78716C", // stone-500 for placeholders
            colorDanger: "#EF4444",
            fontFamily: "'Montserrat', 'Geist', system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              borderColor: "#D6D3D1", // stone-300 - darker border
              borderRadius: "12px",
              padding: "12px",
              backgroundColor: "#FFFFFF",
              color: "#1C1917", // Very dark text
              fontSize: "16px",
            },
            ".Input:focus": {
              borderColor: "#D4AF37", // champagne
              boxShadow: "0 0 0 3px rgba(212, 175, 55, 0.1)",
            },
            ".Input::placeholder": {
              color: "#78716C", // stone-500 - darker placeholder
            },
            ".Label": {
              fontFamily: "'Montserrat', 'Geist', system-ui, sans-serif",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#57534E", // stone-600 - darker for better contrast
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}

