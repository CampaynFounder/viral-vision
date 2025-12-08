import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

/**
 * Admin API to manually update user credits
 * Requires SUPABASE_SERVICE_ROLE_KEY (admin operation)
 * 
 * POST /api/admin/update-credits
 * Body: {
 *   userId: string,
 *   amount: number, // Positive to add, negative to deduct, or "unlimited"
 *   reason: string, // Admin note for why credits were updated
 *   source?: "admin_adjustment" | "refund" | "correction"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, reason, source = "admin_adjustment" } = body;

    // Validate required fields
    if (!userId || amount === undefined || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: userId, amount, reason" },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount !== "unlimited" && typeof amount !== "number") {
      return NextResponse.json(
        { error: "amount must be a number or 'unlimited'" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    if (amount === "unlimited") {
      // Grant unlimited subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: 'active',
          plan_id: 'ceo-access', // Default to CEO Access for unlimited
          current_period_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (subError) {
        console.error("Error updating subscription:", subError);
        return NextResponse.json(
          { error: "Failed to update subscription", details: subError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User granted unlimited access",
        userId,
        reason,
      });
    } else {
      // Insert credit record
      const { data: creditData, error: creditError } = await supabase
        .from('credits')
        .insert({
          user_id: userId,
          amount: amount,
          source: source,
          // Store reason in metadata if you add a metadata field, or create a separate admin_notes table
        })
        .select()
        .single();

      if (creditError) {
        console.error("Error inserting credits:", creditError);
        return NextResponse.json(
          { error: "Failed to update credits", details: creditError.message },
          { status: 500 }
        );
      }

      // Get new total
      const { data: allCredits } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', userId);

      const newTotal = allCredits?.reduce((sum, record) => sum + record.amount, 0) || 0;

      return NextResponse.json({
        success: true,
        message: `Credits updated: ${amount > 0 ? '+' : ''}${amount}`,
        userId,
        newTotal,
        reason,
        creditId: creditData.id,
      });
    }
  } catch (error: any) {
    console.error("Error in update-credits API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/update-credits?userId=xxx
 * Get current credit balance for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
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

    // Check for subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subscription) {
      return NextResponse.json({
        userId,
        credits: "unlimited",
        isUnlimited: true,
        tier: subscription.plan_id,
      });
    }

    // Get total credits
    const { data: creditRecords } = await supabase
      .from('credits')
      .select('amount, source, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const total = creditRecords?.reduce((sum, record) => sum + record.amount, 0) || 0;

    return NextResponse.json({
      userId,
      credits: total,
      isUnlimited: false,
      creditHistory: creditRecords || [],
    });
  } catch (error: any) {
    console.error("Error in GET update-credits API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

