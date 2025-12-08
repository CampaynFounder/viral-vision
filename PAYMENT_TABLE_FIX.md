# Payment Table Fix

## Issue
The `public.users` table may not exist in your Supabase database, causing payment storage to fail.

## Solution
Updated the payments table to reference `auth.users` directly instead of `public.users`. This is more reliable because:
1. `auth.users` always exists in Supabase (it's the default auth table)
2. No dependency on creating `public.users` first
3. Payments can be stored immediately after user authentication

## Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing payments table if it exists (if you already created it)
DROP TABLE IF EXISTS public.payments CASCADE;

-- Create payments table with reference to auth.users
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  product_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  payment_method_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
```

## Optional: Create public.users table

If you want to use `public.users` for additional user profile data, run this:

```sql
-- Create public.users table (optional - for extended user profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

## Testing

After running the migration:
1. Make a test payment as an authenticated user
2. Check that the payment is stored in `public.payments`
3. Verify the `user_id` matches your auth user ID

