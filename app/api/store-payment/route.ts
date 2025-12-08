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

    // Ensure user exists in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError && userError.code !== "PGRST116") {
      // PGRST116 = not found, which is expected for new users
      console.error("Error checking user:", userError);
    }

    // Create user record if it doesn't exist
    if (!userData) {
      const { error: insertUserError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: metadata.email || null,
        })
        .select()
        .single();

      if (insertUserError) {
        console.error("Error creating user:", insertUserError);
        // Continue anyway - user might exist in auth.users
      }
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

    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      message: "Payment stored successfully",
    });
  } catch (error: any) {
    console.error("Error in store-payment API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

