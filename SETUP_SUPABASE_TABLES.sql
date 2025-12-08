-- Viral Vision Database Setup Script
-- Run this in Supabase SQL Editor to create all required tables

-- ============================================
-- 1. CREDITS TABLE
-- ============================================
-- Stores individual credit transactions (grants and deductions)
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  source TEXT, -- 'purchase', 'subscription', 'bonus', 'usage', 'admin_adjustment', 'refund', 'correction'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own credits
CREATE POLICY "Users can view own credits"
  ON public.credits FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only service role can insert credits (via API)
CREATE POLICY "Service role can insert credits"
  ON public.credits FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_created_at ON public.credits(created_at);

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
-- Stores subscription information for unlimited access
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  plan_id TEXT NOT NULL, -- 'ceo-access', 'empire-bundle'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true); -- Service role bypasses RLS

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================
-- Stores payment records from Stripe
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  product_id TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents (e.g., 9700 = $97.00)
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending'
  payment_method_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert payments
CREATE POLICY "Service role can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_product_id ON public.payments(product_id);

-- ============================================
-- 4. USERS TABLE (Optional - extends auth.users)
-- ============================================
-- Optional table to store additional user data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- ============================================
-- 5. SYSTEM PROMPTS TABLE (if not exists)
-- ============================================
-- Stores system prompts for version control
CREATE TABLE IF NOT EXISTS public.system_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify tables were created:

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('credits', 'subscriptions', 'payments', 'users', 'system_prompts')
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('credits', 'subscriptions', 'payments', 'users')
ORDER BY tablename, policyname;

