import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

// Map product IDs to amounts (in cents)
const PRODUCT_AMOUNTS: Record<string, number> = {
  "viral-starter": 2700, // $27.00
  "ceo-access": 4700, // $47.00/month
  "empire-bundle": 9700, // $97.00
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId } = body;

    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { error: "Stripe secret key not configured" },
        { status: 500 }
      );
    }

    // Verify we're using live keys in production (optional check)
    // Stripe automatically handles test vs live based on key prefix
    // pk_live_/sk_live_ = production, pk_test_/sk_test_ = test mode
    if (secretKey.startsWith('sk_test_')) {
      console.warn('⚠️ Using Stripe TEST keys. Switch to sk_live_ for production.');
    }

    const amount = PRODUCT_AMOUNTS[productId];
    if (!amount) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Create Payment Intent via Stripe API
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: "usd",
        automatic_payment_methods: JSON.stringify({ enabled: true }),
        metadata: JSON.stringify({
          productId,
          userId: userId || "anonymous",
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Stripe API error:", error);
      return NextResponse.json(
        { error: "Failed to create payment intent" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      clientSecret: data.client_secret,
      paymentIntentId: data.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

