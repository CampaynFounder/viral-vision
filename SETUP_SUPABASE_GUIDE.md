# Supabase Database Setup Guide

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Run the Setup Script

1. Open the file `SETUP_SUPABASE_TABLES.sql` in this repository
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

## Step 3: Verify Tables Were Created

After running the script, verify the tables exist:

### Option A: Using SQL Editor
Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('credits', 'subscriptions', 'payments', 'users', 'system_prompts')
ORDER BY table_name;
```

You should see:
- `credits`
- `subscriptions`
- `payments`
- `users`
- `system_prompts`

### Option B: Using Table Editor
1. Click **Table Editor** in the left sidebar
2. You should see all the tables listed

## Step 4: Verify Row Level Security (RLS)

Check that RLS policies were created:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('credits', 'subscriptions', 'payments', 'users')
ORDER BY tablename;
```

## Tables Created

### 1. `credits` Table
- Stores individual credit transactions
- Each row is a grant (+) or deduction (-)
- Total credits = SUM of all amounts for a user

### 2. `subscriptions` Table
- Stores subscription information
- Active subscription = unlimited access
- One row per user (UNIQUE constraint on user_id)

### 3. `payments` Table
- Stores Stripe payment records
- Links payments to users and products
- Used to verify purchases and grant credits

### 4. `users` Table (Optional)
- Extends Supabase auth.users
- Stores additional user data
- Not required if you only use auth.users

### 5. `system_prompts` Table
- Stores system prompt versions
- Used for A/B testing and version control

## Troubleshooting

### "relation already exists" error
- Tables already exist - this is fine
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times

### "permission denied" error
- Make sure you're using the SQL Editor (not a restricted user)
- You need admin access to create tables

### Tables not showing in Table Editor
- Refresh the page
- Check that you're in the correct project
- Verify the tables exist using SQL: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

### RLS policies not working
- Make sure RLS is enabled: `ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;`
- Check policies exist using the verification query above

## Next Steps

After creating the tables:

1. **Test credit insertion** (using admin API or SQL):
   ```sql
   INSERT INTO public.credits (user_id, amount, source)
   VALUES ('your-user-uuid', 50, 'purchase');
   ```

2. **Test subscription creation**:
   ```sql
   INSERT INTO public.subscriptions (user_id, status, plan_id)
   VALUES ('your-user-uuid', 'active', 'ceo-access');
   ```

3. **Verify your app can read credits**:
   - Log in to your app
   - Check that credits display correctly
   - Verify database queries work

## Security Notes

- **RLS is enabled** - Users can only see their own data
- **Service role** is required for API operations (inserting credits, payments)
- **Never expose service role key** in client-side code
- All admin operations use service role key (server-side only)

