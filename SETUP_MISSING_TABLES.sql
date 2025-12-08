-- Viral Vision - Create Missing Tables Only
-- This script only creates credits and subscriptions tables
-- (system_prompts and payments already exist)

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

-- Policy: Service role can insert credits (via API)
-- Note: Service role bypasses RLS, but we add this for clarity
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'credits' 
      AND policyname = 'Service role can insert credits'
  ) THEN
    CREATE POLICY "Service role can insert credits"
      ON public.credits FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_created_at ON public.credits(created_at);

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
-- Stores subscription information for unlimited access
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  plan_id TEXT NOT NULL, -- 'ceo-access', 'empire-bundle'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage subscriptions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'subscriptions' 
      AND policyname = 'Service role can manage subscriptions'
  ) THEN
    CREATE POLICY "Service role can manage subscriptions"
      ON public.subscriptions FOR ALL
      USING (true);
  END IF;
END $$;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- 3. USERS TABLE
-- ============================================
-- Table to store additional user data (extends auth.users)
-- Note: This is optional - the app works with just auth.users
-- But some features may benefit from having this table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'Users can view own data'
  ) THEN
    CREATE POLICY "Users can view own data"
      ON public.users FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

-- Policy: Users can update their own data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON public.users FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify tables were created:

SELECT 
  'credits' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'credits') 
    THEN '✓ Created' 
    ELSE '✗ Missing' 
  END as status
UNION ALL
SELECT 
  'subscriptions' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') 
    THEN '✓ Created' 
    ELSE '✗ Missing' 
  END as status
UNION ALL
SELECT 
  'users' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
    THEN '✓ Created' 
    ELSE '✗ Missing' 
  END as status;

