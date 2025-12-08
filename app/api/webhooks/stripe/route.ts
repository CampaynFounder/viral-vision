// Phase 2: Stripe Webhook Handler
// This route will handle Stripe webhook events for payment confirmation

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

/**
 * Stripe Webhook Handler
 * Handles payment events and stores them in the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body;

    // TODO: Verify webhook signature using Stripe webhook secret
    // const signature = request.headers.get("stripe-signature");
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // const verifiedEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase not configured for webhook");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Handle payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata?.userId;

      if (!userId || userId === "anonymous") {
        console.error("Payment intent missing userId:", paymentIntent.id);
        return NextResponse.json({ received: true, warning: "Payment missing userId" });
      }

      // Check if payment already exists (idempotency)
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .single();

      if (!existingPayment) {
        // Store payment in database
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            user_id: userId,
            stripe_payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer || null,
            product_id: paymentIntent.metadata?.productId || "unknown",
            amount: paymentIntent.amount,
            currency: paymentIntent.currency || "usd",
            status: paymentIntent.status,
            payment_method_type: paymentIntent.payment_method_types?.[0] || null,
            metadata: {
              ...paymentIntent.metadata,
              stripeEventId: event.id,
            },
          });

        if (paymentError) {
          console.error("Error storing payment from webhook:", paymentError);
        } else {
          console.log("Payment stored from webhook:", paymentIntent.id);
        }
      }
    }

    // Handle subscription events
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;

      if (userId && userId !== "anonymous") {
        // Update subscription status in database
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_id: subscription.metadata?.productId || "ceo-access",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "stripe_subscription_id",
          });

        if (subError) {
          console.error("Error updating subscription from webhook:", subError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error?.message },
      { status: 500 }
    );
  }
}

