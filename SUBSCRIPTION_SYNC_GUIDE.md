# Subscription-Payment Sync Guide

## Overview
This guide helps ensure subscriptions stay in sync with the payments table. Subscriptions should be created automatically when payments succeed for products that grant unlimited access (`ceo-access`, `empire-bundle`).

## Quick Start

### 1. Run the Setup Script
Run `SYNC_SUBSCRIPTIONS_WITH_PAYMENTS.sql` in Supabase SQL Editor. This creates:
- Verification queries to find mismatches
- Sync function to fix existing data
- Trigger to auto-sync future payments
- Cleanup function for orphaned subscriptions

### 2. Verify Current State
Run the verification queries at the top of the SQL file to check for:
- Payments without subscriptions
- Subscriptions without payments
- Mismatched product IDs

### 3. Sync Existing Data
```sql
-- Sync all subscriptions from payments
SELECT * FROM sync_subscriptions_from_payments();
```

## How It Works

### Automatic Sync (Trigger)
When a payment is inserted/updated with:
- `status = 'succeeded'`
- `product_id IN ('ceo-access', 'empire-bundle')`

The trigger automatically:
1. Creates a subscription if one doesn't exist
2. Updates the subscription if product_id changed
3. Sets status to 'active'

### Manual Sync Function
The `sync_subscriptions_from_payments()` function:
- Finds all succeeded payments for unlimited products
- Creates/updates subscriptions to match
- Returns a report of actions taken

### Cleanup Function
The `cleanup_orphaned_subscriptions()` function:
- Finds active subscriptions without corresponding payments
- Cancels those subscriptions
- Use with caution - only run if you're sure payments are correct

## Verification Queries

### Find Payments Missing Subscriptions
```sql
SELECT 
  p.user_id,
  p.product_id,
  p.amount,
  p.created_at
FROM public.payments p
WHERE p.status = 'succeeded'
  AND p.product_id IN ('ceo-access', 'empire-bundle')
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p.user_id AND s.status = 'active'
  );
```

### Find Subscriptions Without Payments
```sql
SELECT 
  s.user_id,
  s.plan_id,
  s.status
FROM public.subscriptions s
WHERE s.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.user_id = s.user_id
      AND p.product_id = s.plan_id
      AND p.status = 'succeeded'
  );
```

### Find Mismatched Product IDs
```sql
SELECT 
  p.user_id,
  p.product_id as payment_product,
  s.plan_id as subscription_plan
FROM public.payments p
INNER JOIN public.subscriptions s ON p.user_id = s.user_id
WHERE p.status = 'succeeded'
  AND p.product_id IN ('ceo-access', 'empire-bundle')
  AND s.status = 'active'
  AND p.product_id != s.plan_id;
```

## Common Scenarios

### Scenario 1: Payment Made But No Subscription
**Problem**: User paid for CEO Access but subscription wasn't created.

**Solution**:
```sql
-- Option 1: Use sync function
SELECT * FROM sync_subscriptions_from_payments();

-- Option 2: Manual insert
INSERT INTO public.subscriptions (user_id, status, plan_id, current_period_start)
SELECT 
  user_id,
  'active',
  product_id,
  MAX(created_at)
FROM public.payments
WHERE user_id = 'user-uuid-here'
  AND product_id = 'ceo-access'
  AND status = 'succeeded'
GROUP BY user_id, product_id
ON CONFLICT (user_id) DO UPDATE
SET plan_id = EXCLUDED.plan_id, status = 'active';
```

### Scenario 2: Subscription Exists But Wrong Product
**Problem**: Subscription shows `ceo-access` but payment was for `empire-bundle`.

**Solution**:
```sql
-- Update subscription to match payment
UPDATE public.subscriptions
SET 
  plan_id = (
    SELECT product_id 
    FROM public.payments 
    WHERE user_id = subscriptions.user_id 
      AND status = 'succeeded'
      AND product_id IN ('ceo-access', 'empire-bundle')
    ORDER BY created_at DESC
    LIMIT 1
  ),
  updated_at = NOW()
WHERE user_id = 'user-uuid-here'
  AND status = 'active';
```

### Scenario 3: Multiple Payments, Need Latest
**Problem**: User has multiple payments, need subscription to match the latest.

**Solution**:
```sql
-- Sync to most recent payment
INSERT INTO public.subscriptions (user_id, status, plan_id, current_period_start)
SELECT DISTINCT ON (user_id)
  user_id,
  'active',
  product_id,
  created_at
FROM public.payments
WHERE user_id = 'user-uuid-here'
  AND status = 'succeeded'
  AND product_id IN ('ceo-access', 'empire-bundle')
ORDER BY user_id, created_at DESC
ON CONFLICT (user_id) DO UPDATE
SET 
  plan_id = EXCLUDED.plan_id,
  current_period_start = EXCLUDED.current_period_start,
  updated_at = NOW();
```

## Maintenance

### Weekly Check
Run verification queries to catch any issues early:
```sql
-- Quick check: count mismatches
SELECT 
  (SELECT COUNT(*) FROM public.payments p
   WHERE p.status = 'succeeded'
     AND p.product_id IN ('ceo-access', 'empire-bundle')
     AND NOT EXISTS (
       SELECT 1 FROM public.subscriptions s
       WHERE s.user_id = p.user_id AND s.status = 'active'
     )) as missing_subscriptions,
  (SELECT COUNT(*) FROM public.subscriptions s
   WHERE s.status = 'active'
     AND NOT EXISTS (
       SELECT 1 FROM public.payments p
       WHERE p.user_id = s.user_id
         AND p.product_id = s.plan_id
         AND p.status = 'succeeded'
     )) as orphaned_subscriptions;
```

### After Payment Issues
If payments fail or are refunded:
1. Check if subscription should be canceled
2. Run cleanup function if needed (with caution)
3. Verify sync after fixing payments

## Troubleshooting

### Trigger Not Firing
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_sync_subscription';`
- Verify trigger is enabled
- Check payment status is 'succeeded'
- Verify product_id is in ('ceo-access', 'empire-bundle')

### Sync Function Returns No Rows
- All subscriptions are already in sync (good!)
- Or no payments match the criteria
- Check payments table for succeeded payments

### Subscriptions Created But Wrong Product
- Check if user has multiple payments
- Sync function uses most recent payment
- Manually update if needed

## Best Practices

1. **Always verify after manual changes** - Run verification queries
2. **Use the trigger** - Let it handle automatic syncing
3. **Monitor regularly** - Run weekly checks
4. **Document manual fixes** - Note why subscription was manually created/updated
5. **Test in staging first** - Before running cleanup functions

