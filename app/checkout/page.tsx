"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BottomSheet from "@/components/ui/BottomSheet";
import { pricingTiers, PricingTier } from "@/lib/constants/pricing";
import { motion } from "framer-motion";
import { hapticMedium } from "@/lib/utils/haptics";
import StripeProvider from "@/components/payment/StripeProvider";
import StripeCardElement from "@/components/payment/StripeCardElement";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("product") || "viral-starter";
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    const tier = pricingTiers.find((t) => t.id === productId);
    setSelectedTier(tier || pricingTiers[0]);
  }, [productId]);

  const handleCheckout = () => {
    hapticMedium();
    setShowCheckout(true);
  };

  const handlePaymentSubmit = () => {
    // Mock payment processing
    setTimeout(() => {
      setCheckoutSuccess(true);
      // In Phase 2, this will integrate with Stripe
    }, 2000);
  };

  const handleSuccessContinue = () => {
    // Set mock credits in localStorage
    if (selectedTier) {
      if (selectedTier.type === "subscription") {
        localStorage.setItem("subscription", "active");
        localStorage.setItem("credits", "unlimited");
        router.push("/dashboard");
      } else {
        const credits = selectedTier.credits as number;
        localStorage.setItem("credits", credits.toString());
        router.push("/generate");
      }
    }
  };

  if (!selectedTier) return null;

  return (
    <StripeProvider>
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
              className={`p-6 rounded-2xl border-2 ${
                tier.id === selectedTier.id
                  ? "border-champagne bg-champagne/5"
                  : "border-stone-200 bg-white"
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
                  <h3 className="heading-luxury text-2xl text-mocha mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-3xl font-bold text-champagne mb-2">
                    {tier.priceDisplay}
                  </p>
                  <p className="text-mocha-light text-sm">
                    {tier.credits === "unlimited"
                      ? "Unlimited credits"
                      : `${tier.credits} credits`}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-mocha text-sm">
                    <span className="text-champagne mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setSelectedTier(tier);
                  handleCheckout();
                }}
                className={`w-full py-3 rounded-xl font-semibold touch-target transition-all ${
                  tier.id === selectedTier.id
                    ? "bg-champagne text-white hover:bg-champagne-dark shadow-md"
                    : "bg-stone-300 text-mocha-dark hover:bg-stone-400 hover:text-mocha border-2 border-stone-400 shadow-sm"
                }`}
                style={
                  tier.id === selectedTier.id
                    ? { color: '#FFFFFF', backgroundColor: '#D4AF37' }
                    : { color: '#6B5A42', backgroundColor: '#D1D5DB' }
                }
              >
                {tier.cta}
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
      >
        {checkoutSuccess ? (
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
            <h3 className="heading-luxury text-2xl text-mocha mb-2">
              Payment Successful!
            </h3>
            <p className="text-mocha-light mb-6">
              Your access has been activated. Start generating now.
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
            {/* Stripe Elements */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="body-luxury text-xs text-mocha-light mb-2 block">
                  Card Details
                </label>
                <StripeCardElement onCardChange={setCardComplete} />
              </div>
            </div>

            <div className="p-4 bg-stone-100 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-mocha">Total</span>
                <span className="heading-luxury text-xl text-champagne">
                  {selectedTier.priceDisplay}
                </span>
              </div>
              <p className="text-xs text-mocha-light">
                {selectedTier.type === "subscription"
                  ? "Recurring monthly"
                  : "One-time payment"}
              </p>
            </div>

            <button
              onClick={handlePaymentSubmit}
              disabled={!cardComplete}
              className={`w-full py-4 rounded-xl font-semibold touch-target transition-colors ${
                !cardComplete
                  ? "bg-stone-300 text-stone-700 cursor-not-allowed"
                  : "bg-champagne text-white hover:bg-champagne-dark"
              }`}
              style={
                !cardComplete
                  ? { backgroundColor: "#D1D5DB", color: "#44403C" }
                  : { backgroundColor: "#D4AF37", color: "#FFFFFF" }
              }
            >
              Complete Purchase
            </button>
            <p className="text-xs text-mocha-light text-center mt-4">
              Secure payment powered by Stripe (Phase 2)
            </p>
          </div>
        )}
      </BottomSheet>
    </div>
    </StripeProvider>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-alabaster p-6 flex items-center justify-center">
        <div className="text-mocha">Loading...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

