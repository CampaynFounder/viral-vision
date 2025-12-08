# Admin Credit Management Guide

## Overview
This guide explains how to manually update user credits from the backend when issues occur in production.

## API Endpoint

### Update User Credits
**POST** `/api/admin/update-credits`

**Required Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "amount": 100,  // Positive to add, negative to deduct, or "unlimited"
  "reason": "Customer purchased Empire package but only received 50 credits. Adding 50 more.",
  "source": "admin_adjustment"  // Optional: "admin_adjustment" | "refund" | "correction"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Credits updated: +100",
  "userId": "user-uuid-here",
  "newTotal": 150,
  "reason": "Customer purchased Empire package but only received 50 credits. Adding 50 more.",
  "creditId": "credit-record-uuid"
}
```

**Response (Unlimited):**
```json
{
  "success": true,
  "message": "User granted unlimited access",
  "userId": "user-uuid-here",
  "reason": "Customer upgrade to CEO Access"
}
```

### Get User Credits
**GET** `/api/admin/update-credits?userId=user-uuid-here`

**Response:**
```json
{
  "userId": "user-uuid-here",
  "credits": 150,
  "isUnlimited": false,
  "creditHistory": [
    {
      "amount": 100,
      "source": "purchase",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "amount": 50,
      "source": "admin_adjustment",
      "created_at": "2024-01-02T00:00:00Z"
    }
  ]
}
```

## How to Use

### Option 1: Using cURL (Command Line)

**Add Credits:**
```bash
curl -X POST https://vvsprompts.com/api/admin/update-credits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "amount": 50,
    "reason": "Customer purchased Empire package but only received 50 credits. Adding 50 more.",
    "source": "correction"
  }'
```

**Deduct Credits:**
```bash
curl -X POST https://vvsprompts.com/api/admin/update-credits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "amount": -10,
    "reason": "Refund for failed generation",
    "source": "refund"
  }'
```

**Grant Unlimited:**
```bash
curl -X POST https://vvsprompts.com/api/admin/update-credits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "amount": "unlimited",
    "reason": "Customer upgrade to CEO Access",
    "source": "admin_adjustment"
  }'
```

**Check Current Credits:**
```bash
curl "https://vvsprompts.com/api/admin/update-credits?userId=user-uuid-here"
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **credits** table
3. Click **Insert** → **Insert row**
4. Fill in:
   - `user_id`: User's UUID
   - `amount`: Credit amount (positive to add, negative to deduct)
   - `source`: "admin_adjustment", "refund", or "correction"
5. Click **Save**

### Option 3: Using SQL (Supabase SQL Editor)

**Add Credits:**
```sql
INSERT INTO public.credits (user_id, amount, source)
VALUES ('user-uuid-here', 50, 'admin_adjustment');
```

**Check Total Credits:**
```sql
SELECT 
  user_id,
  SUM(amount) as total_credits
FROM public.credits
WHERE user_id = 'user-uuid-here'
GROUP BY user_id;
```

**Check Credit History:**
```sql
SELECT 
  amount,
  source,
  created_at
FROM public.credits
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;
```

## Finding User ID

### From Browser Console (Client-Side)
1. Open browser console on your site
2. Run: `localStorage.getItem('supabase.auth.token')` (if stored)
3. Or check the user object in your app's auth context

### From Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Find user by email
3. Copy the UUID from the user row

### From Payment Records
1. Go to **Table Editor** → **payments** table
2. Find payment by email or payment intent ID
3. Copy the `user_id` from the payment record

## Troubleshooting

### Credits Not Syncing Across Browsers
- Credits are now stored in Supabase, not just localStorage
- User needs to refresh the page to sync
- The `initializeUserCredits` function now fetches from Supabase first

### User Shows Wrong Credits
1. Check Supabase `credits` table for the user
2. Verify no duplicate entries
3. Use GET endpoint to see current total
4. Use POST endpoint to correct if needed

### Payment Made But Credits Not Granted
1. Check `payments` table to verify payment was recorded
2. Check `credits` table to see if credits were inserted
3. If payment exists but credits don't, use admin API to grant credits manually
4. Check webhook logs to see if webhook processed the payment

## Security Notes

- The admin API requires `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- Never expose the service role key in client-side code
- Always include a `reason` field for audit trail
- Consider adding authentication/authorization for admin endpoints in the future

