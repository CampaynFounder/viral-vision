# Fix: Empire Bundle Should Grant Unlimited Credits

## Issue
- Empire Bundle was granting 100 credits instead of unlimited
- Payment amount (9700 cents = $97) was correctly stored, but credit granting logic was wrong

## Changes Made

### 1. Updated `app/api/store-payment/route.ts`
- Changed `empire-bundle` credit mapping from `100` to `"unlimited"`
- Now creates a subscription record for unlimited access (same as CEO Access)

### 2. Updated `lib/constants/pricing.ts`
- Changed Empire Bundle `credits` from `100` to `"unlimited"`
- Updated features list to say "Unlimited generation" instead of "100 credits"

## How to Fix Existing Empire Bundle Purchases

If you already purchased Empire Bundle and only received 100 credits, you need to:

### Option 1: Use Admin API (Recommended)
```bash
curl -X POST https://vvsprompts.com/api/admin/update-credits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-uuid-here",
    "amount": "unlimited",
    "reason": "Empire Bundle should grant unlimited credits, correcting previous purchase",
    "source": "correction"
  }'
```

### Option 2: SQL Update
```sql
-- First, remove the incorrect 100 credit record
DELETE FROM public.credits 
WHERE user_id = 'your-user-uuid-here' 
  AND source = 'purchase' 
  AND amount = 100
  AND created_at > (SELECT created_at FROM public.payments WHERE product_id = 'empire-bundle' AND user_id = 'your-user-uuid-here' ORDER BY created_at DESC LIMIT 1);

-- Then create unlimited subscription
INSERT INTO public.subscriptions (user_id, status, plan_id, current_period_start, updated_at)
VALUES (
  'your-user-uuid-here',
  'active',
  'empire-bundle',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET status = 'active',
    plan_id = 'empire-bundle',
    updated_at = NOW();
```

## Product Credit Mapping (Current)

| Product | Credits Granted |
|---------|----------------|
| Viral Starter | 50 credits |
| CEO Access | Unlimited (subscription) |
| Empire Bundle | Unlimited (one-time purchase) |

## Notes
- Payment `amount` field stores payment amount in cents (e.g., 9700 = $97.00)
- Credits are granted separately based on product purchased
- Both CEO Access and Empire Bundle grant unlimited access via subscriptions table

