# Credits Database as Source of Truth

## Overview
Credits are stored in the database as the **single source of truth**. All credit calculations are done by querying the database, not from cached values.

## Database Schema

### Credits Table
```sql
CREATE TABLE public.credits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL,  -- Positive for grants, negative for deductions
  source TEXT,               -- 'purchase', 'usage', 'bonus', 'admin_adjustment', etc.
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Subscriptions Table (for unlimited access)
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL,      -- 'active', 'canceled', 'past_due'
  plan_id TEXT NOT NULL,     -- 'ceo-access', 'empire-bundle'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## How Credits Are Calculated

### For Limited Credits Users
1. Query `credits` table: `SELECT amount FROM credits WHERE user_id = ?`
2. Sum all amounts: `total = SUM(amount)`
3. This is the **source of truth** - no cached field exists

### For Unlimited Users
1. Query `subscriptions` table: `SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'`
2. If active subscription exists → unlimited access
3. No credits table entries needed (or they're tracked for analytics only)

## Key Functions

### `initializeUserCredits(userId)`
- **Always queries database first** for authenticated users
- Checks `subscriptions` table for unlimited access
- Calculates total from `credits` table by summing transactions
- Only uses localStorage for unauthenticated users or as a cache

### `getTotalCreditsFromDB(userId)`
- **Pure database query** - no localStorage fallback
- Returns 0 if database query fails (not a cached value)
- Database is the authoritative source

### `grantCredits(userId, amount, tier, source)`
- Inserts record into `credits` table
- Updates `subscriptions` table if unlimited
- Database is updated first, then localStorage is cached

### `deductCredits(userId, amount)`
- Inserts negative amount into `credits` table
- Database transaction is the source of truth
- localStorage is updated for performance only

## Important Notes

1. **No Cached Total Field**: There is no `total_credits` field stored anywhere. We always calculate from the `credits` table.

2. **Database First**: For authenticated users, we ALWAYS query the database. localStorage is only used as a cache for performance, never as a fallback.

3. **Transaction-Based**: Credits are stored as individual transactions (grants and deductions), and we calculate the total by summing them.

4. **Unlimited Access**: Stored in `subscriptions` table, not in `credits` table. If a user has an active subscription, they have unlimited access regardless of credit transactions.

## Query Examples

### Get Total Credits for a User
```sql
-- Calculate total from transactions
SELECT COALESCE(SUM(amount), 0) as total_credits
FROM public.credits
WHERE user_id = 'user-uuid-here';
```

### Check for Unlimited Access
```sql
SELECT plan_id, status
FROM public.subscriptions
WHERE user_id = 'user-uuid-here'
  AND status = 'active';
```

### Get Complete Credit Status
```sql
-- Check subscription first
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE user_id = 'user-uuid-here' AND status = 'active'
    ) THEN 'unlimited'
    ELSE CAST(
      COALESCE((
        SELECT SUM(amount) FROM public.credits WHERE user_id = 'user-uuid-here'
      ), 0) AS TEXT
    )
  END as credit_status;
```

## localStorage Usage

localStorage is used **only** for:
1. **Performance caching** - to avoid repeated database queries
2. **Unauthenticated users** - temporary storage before login
3. **Offline support** - cached value when database is unavailable

**localStorage is NOT the source of truth** - it's always synced FROM the database, never TO it.

## Migration Notes

If you need to ensure all users have correct credits:
1. Clear localStorage for all users (they'll re-fetch from DB)
2. Verify database has correct credit transactions
3. Recalculate totals: `SELECT user_id, SUM(amount) FROM credits GROUP BY user_id`

