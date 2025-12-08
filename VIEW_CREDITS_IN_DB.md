# How to View Credits in the Database

## Option 1: Supabase Dashboard (Easiest)

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open Table Editor**
   - Click **Table Editor** in the left sidebar
   - Find and click on the **`credits`** table

3. **View All Credits**
   - You'll see all credit records with:
     - `id`: UUID of the credit record
     - `user_id`: UUID of the user who owns the credits
     - `amount`: Credit amount (positive for grants, negative for deductions)
     - `source`: Where credits came from (`purchase`, `subscription`, `bonus`, `usage`, `admin_adjustment`, etc.)
     - `expires_at`: Optional expiration date
     - `created_at`: When the credit record was created

4. **Filter by User**
   - Click the filter icon (funnel) at the top
   - Select `user_id` column
   - Choose "equals" and paste the user's UUID
   - Click "Apply"

## Option 2: SQL Editor (Most Powerful)

1. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **View All Credits for a Specific User**
   ```sql
   -- Replace 'user-uuid-here' with the actual user UUID
   SELECT 
     id,
     user_id,
     amount,
     source,
     created_at,
     expires_at
   FROM public.credits
   WHERE user_id = 'user-uuid-here'
   ORDER BY created_at DESC;
   ```

3. **Get Total Credits for a User**
   ```sql
   -- Replace 'user-uuid-here' with the actual user UUID
   SELECT 
     user_id,
     SUM(amount) as total_credits,
     COUNT(*) as transaction_count
   FROM public.credits
   WHERE user_id = 'user-uuid-here'
   GROUP BY user_id;
   ```

4. **View All Users and Their Credit Totals**
   ```sql
   SELECT 
     c.user_id,
     u.email,
     SUM(c.amount) as total_credits,
     COUNT(c.id) as transaction_count,
     MAX(c.created_at) as last_transaction
   FROM public.credits c
   LEFT JOIN auth.users u ON c.user_id = u.id
   GROUP BY c.user_id, u.email
   ORDER BY total_credits DESC;
   ```

5. **View Credit History with User Emails**
   ```sql
   SELECT 
     c.id,
     c.user_id,
     u.email,
     c.amount,
     c.source,
     c.created_at
   FROM public.credits c
   LEFT JOIN auth.users u ON c.user_id = u.id
   ORDER BY c.created_at DESC
   LIMIT 100;
   ```

6. **Find Users with Specific Credit Amounts**
   ```sql
   -- Find users with exactly 100 credits
   SELECT 
     user_id,
     SUM(amount) as total_credits
   FROM public.credits
   GROUP BY user_id
   HAVING SUM(amount) = 100;
   ```

7. **View Credits by Source**
   ```sql
   SELECT 
     source,
     COUNT(*) as count,
     SUM(amount) as total_amount
   FROM public.credits
   GROUP BY source
   ORDER BY total_amount DESC;
   ```

## Option 3: Using the Admin API

### Check Credits for a User
```bash
# Replace 'user-uuid-here' with the actual user UUID
curl "https://vvsprompts.com/api/admin/update-credits?userId=user-uuid-here"
```

**Response:**
```json
{
  "userId": "user-uuid-here",
  "credits": 100,
  "isUnlimited": false,
  "creditHistory": [
    {
      "amount": 50,
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

## Finding a User's UUID

### Method 1: From Payments Table
```sql
SELECT DISTINCT user_id, email
FROM public.payments p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'user@example.com';
```

### Method 2: From Auth Users Table
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'user@example.com';
```

### Method 3: From Browser Console (Client-Side)
1. Open your site in browser
2. Open Developer Console (F12)
3. Run:
   ```javascript
   // If using localStorage
   localStorage.getItem('supabase.auth.token')
   
   // Or check your app's auth context
   // The user object should have an 'id' field
   ```

## Understanding Credit Records

### Positive Amounts (Credits Added)
- `amount > 0`: Credits granted
- Common sources:
  - `purchase`: From product purchase
  - `bonus`: Free credits (first-time bonus, etc.)
  - `admin_adjustment`: Manually added by admin
  - `refund`: Credits refunded
  - `correction`: Error correction

### Negative Amounts (Credits Deducted)
- `amount < 0`: Credits used
- Common sources:
  - `usage`: Credits deducted for prompt generation

### Example Credit Flow
```
User purchases Empire Bundle ($97):
1. Payment recorded in `payments` table
2. Credit record created: amount=100, source='purchase'
3. User generates prompt (costs 10 credits):
   - Credit record created: amount=-10, source='usage'
4. Total credits: 100 - 10 = 90
```

## Quick Reference: Common Queries

### Check if user has unlimited subscription
```sql
SELECT 
  s.user_id,
  s.plan_id,
  s.status,
  s.current_period_start
FROM public.subscriptions s
WHERE s.user_id = 'user-uuid-here'
  AND s.status = 'active';
```

### Get complete user credit summary
```sql
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(SUM(c.amount), 0) as total_credits,
  s.status as subscription_status,
  s.plan_id as subscription_plan
FROM auth.users u
LEFT JOIN public.credits c ON u.id = c.user_id
LEFT JOIN public.subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.email, s.status, s.plan_id;
```

## Troubleshooting

### Credits not showing up?
1. Check if payment was recorded:
   ```sql
   SELECT * FROM public.payments 
   WHERE user_id = 'user-uuid-here' 
   ORDER BY created_at DESC;
   ```

2. Check if credits were granted:
   ```sql
   SELECT * FROM public.credits 
   WHERE user_id = 'user-uuid-here' 
   ORDER BY created_at DESC;
   ```

3. Verify user exists:
   ```sql
   SELECT id, email FROM auth.users 
   WHERE id = 'user-uuid-here';
   ```

### Credits showing wrong amount?
1. Check for duplicate credit grants:
   ```sql
   SELECT 
     user_id,
     source,
     COUNT(*) as count,
     SUM(amount) as total
   FROM public.credits
   WHERE user_id = 'user-uuid-here'
   GROUP BY user_id, source
   HAVING COUNT(*) > 1;
   ```

2. Check for negative balances:
   ```sql
   SELECT 
     user_id,
     SUM(amount) as total_credits
   FROM public.credits
   WHERE user_id = 'user-uuid-here'
   GROUP BY user_id
   HAVING SUM(amount) < 0;
   ```

