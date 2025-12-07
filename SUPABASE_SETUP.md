# Supabase Setup: Where to Put Your Connection Details

## Important: Supabase Doesn't Use a "Connection String"

Instead of a connection string, Supabase uses:
1. **Project URL** - Your Supabase project endpoint
2. **Anon Key** - Public key for client-side (safe to expose)
3. **Service Role Key** - Secret key for server-side only (keep private!)

## Where to Put Supabase Credentials

### 1. Environment Variables (Required)

#### For Local Development
Create `.env.local` file in project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### For Cloudflare Pages (Production)
1. Go to **Cloudflare Dashboard**
2. **Pages** → Your Project (`viral-vision`)
3. **Settings** → **Environment Variables**
4. Add these three variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Set for **Production** environment

## How to Get Your Supabase Credentials

### Step 1: Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - Name: `viral-vision`
   - Database Password: (create strong password)
   - Region: (choose closest to users)
4. Wait ~2 minutes for project creation

### Step 2: Get Your Keys
1. In Supabase Dashboard → **Settings** → **API**
2. You'll see three values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
→ This goes in `NEXT_PUBLIC_SUPABASE_URL`

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
→ This goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**service_role key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
→ This goes in `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## What Each Key Is Used For

### `NEXT_PUBLIC_SUPABASE_URL`
- **Where**: Client-side and server-side
- **Purpose**: Endpoint for all Supabase requests
- **Security**: Safe to expose (public)

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Where**: Client-side (browser)
- **Purpose**: Authenticated requests, respects RLS policies
- **Security**: Safe to expose (public, but protected by RLS)

### `SUPABASE_SERVICE_ROLE_KEY`
- **Where**: Server-side only (API routes)
- **Purpose**: Bypass RLS for admin operations
- **Security**: ⚠️ **NEVER expose to client!** Server-side only!

## Setting Up Supabase Client

### Step 1: Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### Step 2: Create Client Utility
Create `lib/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 3: Create Server-Side Client (for API routes)
Create `lib/supabase/server.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

## Usage Examples

### Client-Side (Components)
```typescript
'use client'

import { supabase } from '@/lib/supabase/client'

// Get user data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
```

### Server-Side (API Routes)
```typescript
import { supabaseAdmin } from '@/lib/supabase/server'

// Admin operation (bypasses RLS)
const { data, error } = await supabaseAdmin
  .from('credits')
  .insert({ user_id: userId, amount: 50 })
```

## Environment Variables Checklist

### Local Development (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Other services
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Cloudflare Pages (Dashboard)
Add all the same variables in:
- **Pages** → **Your Project** → **Settings** → **Environment Variables**
- Set for **Production** environment

## Security Best Practices

1. ✅ **Never commit `.env.local`** to git (it's in `.gitignore`)
2. ✅ **Use `NEXT_PUBLIC_*` prefix** for client-side variables
3. ✅ **Keep service role key secret** (server-side only)
4. ✅ **Use anon key for client** (protected by RLS)
5. ✅ **Set RLS policies** in Supabase (already in `schema.sql`)

## Quick Setup Checklist

- [ ] Create Supabase project
- [ ] Get Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Get anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Get service role key → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add to `.env.local` for local development
- [ ] Add to Cloudflare Pages environment variables
- [ ] Run `lib/db/schema.sql` in Supabase SQL Editor
- [ ] Install `@supabase/supabase-js` package
- [ ] Create client utilities (`lib/supabase/client.ts`)

## Troubleshooting

### "Invalid API key" error
- Check you copied the full key (they're long!)
- Verify key matches the project
- Check environment variable name is correct

### "RLS policy violation" error
- This is normal for client-side requests
- Use service role key for admin operations
- Check RLS policies in Supabase dashboard

### Environment variables not loading
- Restart dev server after adding to `.env.local`
- Check variable names match exactly
- Verify `NEXT_PUBLIC_*` prefix for client-side vars

## Next Steps

After setting up credentials:
1. Run database schema (`lib/db/schema.sql`)
2. Test connection with a simple query
3. Set up authentication (Supabase Auth)
4. Replace localStorage with Supabase

