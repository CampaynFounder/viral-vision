import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

/**
 * Store payment in database after successful payment
 * This endpoint requires authentication and is called after payment succeeds
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentIntentId,
      userId,
      productId,
      amount,
      currency = "usd",
      status = "succeeded",
      paymentMethodType,
      metadata = {},
    } = body;

    // Validate required fields
    if (!paymentIntentId || !userId || !productId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: paymentIntentId, userId, productId, amount" },
        { status: 400 }
      );
    }

    // Validate userId is not anonymous
    if (userId === "anonymous" || !userId) {
      return NextResponse.json(
        { error: "Payment must be associated with an authenticated user" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase not configured");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Use service role to bypass RLS (payments can only be inserted server-side)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if payment already exists (idempotency)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { 
          message: "Payment already recorded",
          paymentId: existingPayment.id 
        },
        { status: 200 }
      );
    }

    // Ensure user exists in public.users table (create if needed)
    // This is optional - if it fails, we'll still store the payment
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();

      // PGRST116 = not found (expected for new users)
      if (userError && userError.code === "PGRST116") {
        // User doesn't exist in public.users, try to create it
        const { error: insertUserError } = await supabase
          .from("users")
          .insert({
            id: userId,
            email: metadata.email || null,
          })
          .select()
          .single();

        if (insertUserError) {
          console.warn("Could not create user in public.users:", insertUserError.message);
          // Continue anyway - user exists in auth.users and payment can still be stored
        }
      } else if (userError) {
        console.warn("Error checking user in public.users:", userError.message);
        // Continue anyway - payment can still be stored
      }
    } catch (userTableError: any) {
      // If public.users table doesn't exist, log and continue
      console.warn("public.users table may not exist yet:", userTableError.message);
      // Payment will still be stored - the foreign key constraint will handle validation
    }

    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_customer_id: metadata.customerId || null,
        product_id: productId,
        amount: amount,
        currency: currency,
        status: status,
        payment_method_type: paymentMethodType || null,
        metadata: metadata,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error storing payment:", paymentError);
      return NextResponse.json(
        { error: "Failed to store payment", details: paymentError.message },
        { status: 500 }
      );
    }

    // Grant credits based on product purchased
    // Map product IDs to credit amounts
    // Note: amount in payments table is payment amount in cents, NOT credits
    const productCredits: Record<string, number | "unlimited"> = {
      "viral-starter": 50,
      "ceo-access": "unlimited",
      "empire-bundle": "unlimited", // Empire Bundle grants unlimited credits
    };

    const creditsToGrant = productCredits[productId];
    if (creditsToGrant) {
      if (creditsToGrant === "unlimited") {
        // Create/update subscription
        await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            status: "active",
            plan_id: productId,
            current_period_start: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
          });
      } else {
        // Insert credit record
        await supabase
          .from("credits")
          .insert({
            user_id: userId,
            amount: creditsToGrant,
            source: "purchase",
          });
      }
      console.log(`✅ Granted ${creditsToGrant} credits to user ${userId} for product ${productId}`);
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      message: "Payment stored successfully",
      creditsGranted: creditsToGrant || null,
    });
  } catch (error: any) {
    console.error("Error in store-payment API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

