-- Sync Subscriptions with Payments Table
-- This ensures subscriptions match what's in the payments table

-- ============================================
-- 1. VERIFICATION QUERY
-- ============================================
-- Check for mismatches between payments and subscriptions

-- Find payments that should have subscriptions but don't
SELECT 
  p.user_id,
  p.product_id,
  p.amount,
  p.created_at as payment_date,
  'Missing subscription' as issue
FROM public.payments p
WHERE p.status = 'succeeded'
  AND p.product_id IN ('ceo-access', 'empire-bundle')  -- Products that grant unlimited
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p.user_id
      AND s.status = 'active'
  )
ORDER BY p.created_at DESC;

-- Find subscriptions that don't have corresponding payments
SELECT 
  s.user_id,
  s.plan_id,
  s.status,
  s.created_at as subscription_date,
  'No payment found' as issue
FROM public.subscriptions s
WHERE s.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.user_id = s.user_id
      AND p.product_id = s.plan_id
      AND p.status = 'succeeded'
  )
ORDER BY s.created_at DESC;

-- Find mismatched product_ids between payments and subscriptions
SELECT 
  p.user_id,
  p.product_id as payment_product,
  s.plan_id as subscription_plan,
  'Mismatched product' as issue
FROM public.payments p
INNER JOIN public.subscriptions s ON p.user_id = s.user_id
WHERE p.status = 'succeeded'
  AND p.product_id IN ('ceo-access', 'empire-bundle')
  AND s.status = 'active'
  AND p.product_id != s.plan_id;

-- ============================================
-- 2. SYNC FUNCTION
-- ============================================
-- Function to sync subscriptions based on payments

CREATE OR REPLACE FUNCTION sync_subscriptions_from_payments()
RETURNS TABLE(
  user_id UUID,
  action TEXT,
  product_id TEXT,
  message TEXT
) AS $$
DECLARE
  payment_record RECORD;
  subscription_exists BOOLEAN;
BEGIN
  -- Loop through all succeeded payments for unlimited products
  FOR payment_record IN
    SELECT DISTINCT ON (p.user_id, p.product_id)
      p.user_id,
      p.product_id,
      p.created_at
    FROM public.payments p
    WHERE p.status = 'succeeded'
      AND p.product_id IN ('ceo-access', 'empire-bundle')
    ORDER BY p.user_id, p.product_id, p.created_at DESC
  LOOP
    -- Check if subscription already exists
    SELECT EXISTS(
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.user_id = payment_record.user_id
        AND subscriptions.status = 'active'
    ) INTO subscription_exists;
    
    IF NOT subscription_exists THEN
      -- Create subscription
      INSERT INTO public.subscriptions (
        user_id,
        status,
        plan_id,
        current_period_start,
        updated_at
      )
      VALUES (
        payment_record.user_id,
        'active',
        payment_record.product_id,
        payment_record.created_at,
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE
      SET 
        status = 'active',
        plan_id = payment_record.product_id,
        current_period_start = payment_record.created_at,
        updated_at = NOW();
      
      RETURN QUERY SELECT
        payment_record.user_id as synced_user_id,
        'created'::TEXT,
        payment_record.product_id,
        'Subscription created from payment'::TEXT;
    ELSE
      -- Update existing subscription if product_id doesn't match
      UPDATE public.subscriptions
      SET 
        plan_id = payment_record.product_id,
        updated_at = NOW()
      WHERE subscriptions.user_id = payment_record.user_id
        AND subscriptions.status = 'active'
        AND subscriptions.plan_id != payment_record.product_id;
      
      IF FOUND THEN
        RETURN QUERY SELECT
          payment_record.user_id as synced_user_id,
          'updated'::TEXT,
          payment_record.product_id,
          'Subscription updated to match payment'::TEXT;
      END IF;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TRIGGER FUNCTION (Auto-sync on payment insert)
-- ============================================
-- Automatically create/update subscription when payment is inserted

CREATE OR REPLACE FUNCTION auto_sync_subscription_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process succeeded payments for unlimited products
  IF NEW.status = 'succeeded' AND NEW.product_id IN ('ceo-access', 'empire-bundle') THEN
    -- Insert or update subscription
    INSERT INTO public.subscriptions (
      user_id,
      status,
      plan_id,
      current_period_start,
      updated_at
    )
    VALUES (
      NEW.user_id,
      'active',
      NEW.product_id,
      NEW.created_at,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      status = 'active',
      plan_id = NEW.product_id,
      current_period_start = NEW.created_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_sync_subscription ON public.payments;
CREATE TRIGGER trigger_auto_sync_subscription
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  WHEN (NEW.status = 'succeeded' AND NEW.product_id IN ('ceo-access', 'empire-bundle'))
  EXECUTE FUNCTION auto_sync_subscription_on_payment();

-- ============================================
-- 4. MANUAL SYNC SCRIPT
-- ============================================
-- Run this to sync all existing payments with subscriptions

-- Option 1: Use the sync function
SELECT * FROM sync_subscriptions_from_payments();

-- Option 2: Manual sync for specific users
-- Replace 'user-uuid-here' with actual user ID
/*
INSERT INTO public.subscriptions (
  user_id,
  status,
  plan_id,
  current_period_start,
  updated_at
)
SELECT DISTINCT ON (p.user_id)
  p.user_id,
  'active',
  p.product_id,
  MAX(p.created_at),
  NOW()
FROM public.payments p
WHERE p.user_id = 'user-uuid-here'
  AND p.status = 'succeeded'
  AND p.product_id IN ('ceo-access', 'empire-bundle')
GROUP BY p.user_id, p.product_id
ORDER BY p.user_id, p.product_id, MAX(p.created_at) DESC
ON CONFLICT (public.subscriptions.user_id) DO UPDATE
SET 
  status = 'active',
  plan_id = EXCLUDED.plan_id,
  current_period_start = EXCLUDED.current_period_start,
  updated_at = NOW();
*/

-- ============================================
-- 5. CLEANUP FUNCTION
-- ============================================
-- Remove subscriptions that don't have corresponding payments

CREATE OR REPLACE FUNCTION cleanup_orphaned_subscriptions()
RETURNS TABLE(
  user_id UUID,
  plan_id TEXT,
  action TEXT
) AS $$
DECLARE
  sub_record RECORD;
BEGIN
  FOR sub_record IN
    SELECT s.user_id, s.plan_id
    FROM public.subscriptions s
    WHERE s.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM public.payments p
        WHERE p.user_id = s.user_id
          AND p.product_id = s.plan_id
          AND p.status = 'succeeded'
      )
  LOOP
    -- Cancel the subscription
    UPDATE public.subscriptions
    SET 
      status = 'canceled',
      updated_at = NOW()
    WHERE public.subscriptions.user_id = sub_record.user_id
      AND public.subscriptions.status = 'active';
    
    RETURN QUERY SELECT
      sub_record.user_id,
      sub_record.plan_id,
      'canceled'::TEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- 1. Check for mismatches
-- Run the verification queries at the top

-- 2. Sync all subscriptions from payments
-- SELECT * FROM sync_subscriptions_from_payments();

-- 3. Clean up orphaned subscriptions (use with caution)
-- SELECT * FROM cleanup_orphaned_subscriptions();

-- 4. Check trigger is working
-- INSERT INTO public.payments (user_id, stripe_payment_intent_id, product_id, amount, status)
-- VALUES ('test-user-id', 'test-pi-123', 'ceo-access', 4700, 'succeeded');
-- Then check if subscription was auto-created

