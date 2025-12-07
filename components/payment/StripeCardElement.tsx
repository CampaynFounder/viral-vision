"use client";

import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";

interface StripeCardElementProps {
  onCardChange?: (complete: boolean) => void;
}

export default function StripeCardElement({ onCardChange }: StripeCardElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  const cardElementOptions = {
    style: {
      base: {
        color: "#6B5A42", // mocha
        fontFamily: "'Montserrat', 'Geist', system-ui, sans-serif",
        fontSize: "16px",
        "::placeholder": {
          color: "#A68B6B", // mocha-light
        },
      },
      invalid: {
        color: "#EF4444", // red-500
        iconColor: "#EF4444",
      },
    },
    hidePostalCode: true, // We'll handle this separately if needed
  };

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
      onCardChange?.(false);
    } else {
      setCardError(null);
      onCardChange?.(event.complete);
    }
  };

  return (
    <div>
      <div className="p-4 border-2 border-stone-200 rounded-xl bg-white focus-within:border-champagne transition-colors">
        <CardElement
          options={cardElementOptions}
          onChange={handleCardChange}
        />
      </div>
      {cardError && (
        <p className="text-xs text-red-600 mt-2">{cardError}</p>
      )}
    </div>
  );
}

