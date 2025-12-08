"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BottomSheet from "@/components/ui/BottomSheet";
import { pricingTiers, PricingTier } from "@/lib/constants/pricing";
import { motion } from "framer-motion";
import { hapticMedium } from "@/lib/utils/haptics";
import StripeProvider from "@/components/payment/StripeProvider";
import StripeCardElement from "@/components/payment/StripeCardElement";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const productId = searchParams.get("product") || "viral-starter";
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  useEffect(() => {
    const tier = pricingTiers.find((t) => t.id === productId);
    setSelectedTier(tier || pricingTiers[0]);
  }, [productId]);

  // Guard against Stripe not being loaded (after all hooks)
  if (!stripe || !elements) {
    return (
      <div className="min-h-screen bg-alabaster p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-mocha mb-4">Loading payment system...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-champagne mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    hapticMedium();
    
    // Require authentication before allowing payment
    if (!user) {
      // Store the selected tier and redirect to auth
      sessionStorage.setItem("checkoutRedirect", JSON.stringify({
        productId: selectedTier?.id,
        returnUrl: "/checkout"
      }));
      router.push("/auth?redirect=/checkout&message=Please create an account to complete your purchase");
      return;
    }
    
    setShowCheckout(true);
  };

  const handlePaymentSubmit = async () => {
    // CRITICAL: Require authentication before payment
    if (!user) {
      setError("Please sign in or create an account before making a payment.");
      router.push("/auth?redirect=/checkout&message=Please create an account to complete your purchase");
      return;
    }

    if (!stripe || !elements || !selectedTier) {
      setError("Payment system is loading. Please wait a moment and try again.");
      return;
    }

    setProcessing(true);
    setError(null);
    hapticMedium();

    try {
      // Step 1: Create Payment Intent (with authenticated user ID)
      if (!clientSecret) {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: selectedTier.id,
            userId: user.id, // Always authenticated at this point
          }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to create payment intent";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const { clientSecret: secret, paymentIntentId: intentId } = await response.json();
        setClientSecret(secret);
        setPaymentIntentId(intentId);
        
        // Step 2: Confirm Payment
        const cardElement = elements.getElement("card");
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(secret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (confirmError) {
          throw new Error(confirmError.message || "Payment failed");
        }

        if (paymentIntent?.status === "succeeded") {
          // Store payment in database immediately
          await storePaymentInDatabase(paymentIntent, selectedTier);
          
          // Grant credits
          const { grantCredits } = require("@/lib/utils/credits-manager");
          await grantCredits(
            user.id,
            selectedTier.credits === "unlimited" ? "unlimited" : (selectedTier.credits as number),
            selectedTier.id,
            selectedTier.type === "subscription" ? "subscription" : "purchase"
          );

          setCheckoutSuccess(true);
        } else {
          throw new Error("Payment not completed");
        }
      } else {
        // Payment intent already created, just confirm
        const cardElement = elements.getElement("card");
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (confirmError) {
          throw new Error(confirmError.message || "Payment failed");
        }

        if (paymentIntent?.status === "succeeded") {
          // Store payment in database immediately
          await storePaymentInDatabase(paymentIntent, selectedTier);
          
          // Grant credits
          const { grantCredits } = require("@/lib/utils/credits-manager");
          await grantCredits(
            user.id,
            selectedTier.credits === "unlimited" ? "unlimited" : (selectedTier.credits as number),
            selectedTier.id,
            selectedTier.type === "subscription" ? "subscription" : "purchase"
          );

          setCheckoutSuccess(true);
        } else {
          throw new Error("Payment not completed");
        }
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to store payment in database
  const storePaymentInDatabase = async (paymentIntent: any, tier: PricingTier) => {
    try {
      const storePaymentResponse = await fetch("/api/store-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          userId: user!.id,
          productId: tier.id,
          amount: tier.price * 100, // Convert to cents
          currency: "usd",
          status: "succeeded",
          paymentMethodType: paymentIntent.payment_method_types?.[0] || "card",
          metadata: {
            email: user!.email,
            productName: tier.name,
            tierType: tier.type,
          },
        }),
      });

      if (!storePaymentResponse.ok) {
        const errorData = await storePaymentResponse.json();
        console.error("Failed to store payment:", errorData);
        throw new Error("Payment succeeded but failed to record. Please contact support with payment ID: " + paymentIntent.id);
      }

      const { paymentId } = await storePaymentResponse.json();
      console.log("Payment stored successfully:", paymentId);
    } catch (storeError: any) {
      console.error("Error storing payment:", storeError);
      // Re-throw to prevent payment completion if storage fails
      throw storeError;
    }
  };

  const handleSuccessContinue = async () => {
    // Credits already granted in handlePaymentSubmit
    // Just redirect based on tier type
    if (selectedTier) {
      if (selectedTier.type === "subscription") {
        router.push("/dashboard");
      } else {
        router.push("/generate");
      }
    }
  };

  if (!selectedTier) return null;

  return (
    <div className="min-h-screen bg-alabaster p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="heading-luxury text-3xl text-mocha mb-8">
            Choose Your Access
          </h1>

        {/* Pricing Cards */}
        <div className="space-y-4 mb-8">
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                tier.id === selectedTier.id
                  ? "border-champagne bg-champagne/10 shadow-lg shadow-champagne/20"
                  : "border-stone-200 bg-white hover:border-stone-300"
              } ${tier.popular ? "ring-2 ring-champagne" : ""}`}
            >
              {tier.popular && (
                <div className="mb-2">
                  <span className="body-luxury text-xs bg-champagne text-white px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`heading-luxury text-2xl mb-2 ${
                    tier.id === selectedTier.id ? "text-mocha-dark" : "text-mocha"
                  }`}>
                    {tier.name}
                  </h3>
                  <p className={`text-3xl font-bold mb-2 ${
                    tier.id === selectedTier.id ? "text-champagne-dark" : "text-champagne"
                  }`}>
                    {tier.priceDisplay}
                  </p>
                  <p className={`text-sm ${
                    tier.id === selectedTier.id ? "text-mocha" : "text-mocha-light"
                  }`}>
                    {tier.credits === "unlimited"
                      ? "Unlimited credits"
                      : `${tier.credits} credits`}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-start gap-2 text-sm ${
                    tier.id === selectedTier.id ? "text-mocha-dark" : "text-mocha"
                  }`}>
                    <span className={`mt-1 ${
                      tier.id === selectedTier.id ? "text-champagne-dark" : "text-champagne"
                    }`}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setSelectedTier(tier);
                  handleCheckout();
                }}
                className={`w-full py-3 rounded-xl font-semibold touch-target transition-colors overflow-hidden ${
                  tier.id === selectedTier.id
                    ? "bg-champagne-dark text-white hover:bg-champagne shadow-md"
                    : "bg-champagne text-white hover:bg-champagne-dark"
                }`}
                style={
                  tier.id === selectedTier.id
                    ? { backgroundColor: '#B8941F', color: '#FFFFFF', maxWidth: '100%' }
                    : { backgroundColor: '#D4AF37', color: '#FFFFFF', maxWidth: '100%' }
                }
              >
                <span className="truncate block">{tier.cta}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Checkout Bottom Sheet */}
      <BottomSheet
        isOpen={showCheckout}
        onClose={() => {
          if (!checkoutSuccess) setShowCheckout(false);
        }}
        title="Complete Your Purchase"
        titleStyle={{ color: '#1C1917', fontWeight: 'bold' }}
      >
        {checkoutSuccess ? (
          // Success message (user is always authenticated at this point)
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-4 text-champagne"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
            <h3 className="heading-luxury text-2xl text-white mb-2 font-bold" style={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.3)' }}>
              Payment Successful!
            </h3>
            <p className="text-white mb-6 font-medium" style={{ color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.3)' }}>
              Your payment has been recorded and your access has been activated. Start generating now.
            </p>
            <button
              onClick={handleSuccessContinue}
              className="w-full py-3 bg-champagne text-white rounded-xl font-semibold touch-target hover:bg-champagne-dark transition-colors"
              style={{ color: '#FFFFFF', backgroundColor: '#D4AF37' }}
            >
              Start Generating
            </button>
          </motion.div>
        ) : (
          <div className="py-4">
            {/* Instructions Text */}
            <div className="mb-6 pb-4 border-b border-stone-200">
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#1C1917' }}>
                Enter your payment details below to complete your purchase. Your payment is secure and encrypted.
              </p>
            </div>
            
            {/* Stripe Elements */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="body-luxury text-xs font-semibold mb-2 block" style={{ color: '#1C1917', fontWeight: '600' }}>
                  Card Details
                </label>
                {stripe && elements ? (
                  <StripeCardElement onCardChange={setCardComplete} />
                ) : (
                  <div className="p-4 border-2 border-stone-300 rounded-xl bg-stone-50">
                    <p className="text-sm text-mocha">Loading payment form...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-100 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold" style={{ color: '#1C1917' }}>Total</span>
                <span className="heading-luxury text-xl font-bold" style={{ color: '#D4AF37' }}>
                  {selectedTier.priceDisplay}
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: '#1C1917' }}>
                {selectedTier.type === "subscription"
                  ? "Recurring monthly"
                  : "One-time payment"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handlePaymentSubmit}
              disabled={!cardComplete || processing || !stripe || !elements}
              className={`w-full py-4 rounded-xl font-semibold touch-target transition-colors overflow-hidden ${
                !cardComplete || processing || !stripe || !elements
                  ? "bg-stone-200 cursor-not-allowed"
                  : "bg-champagne text-white hover:bg-champagne-dark"
              }`}
              style={
                !cardComplete || processing || !stripe || !elements
                  ? { backgroundColor: "#E7E5E4", color: "#1C1917", maxWidth: '100%', fontWeight: '700' }
                  : { backgroundColor: "#D4AF37", color: "#FFFFFF", maxWidth: '100%', fontWeight: '700' }
              }
            >
              <span className="truncate block font-bold" style={{ color: !cardComplete || processing || !stripe || !elements ? '#1C1917' : '#FFFFFF' }}>
                {!stripe || !elements ? "Loading..." : processing ? "Processing..." : "Complete Purchase"}
              </span>
            </button>
            <p className="text-xs text-center mt-4 font-medium" style={{ color: '#1C1917' }}>
              Secure payment powered by Stripe
            </p>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <StripeProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-alabaster p-6 flex items-center justify-center">
          <div className="text-mocha">Loading...</div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </StripeProvider>
  );
}

