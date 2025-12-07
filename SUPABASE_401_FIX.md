# Quick Fix: 401 Unauthorized on Sign Up

## Most Common Causes

### 1. ⚠️ Environment Variables Not Set (90% of cases)

**Check Cloudflare Pages:**
1. Go to **Cloudflare Pages** → Your Project → **Settings** → **Environment Variables**
2. Verify these are set for **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Redeploy** after adding variables

### 2. ⚠️ Email Provider Not Enabled

**In Supabase Dashboard:**
1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **Enabled** (toggle should be ON)

### 3. ⚠️ Redirect URL Not Allowed

**In Supabase Dashboard:**
1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   https://vvsprompts.com/auth/callback
   https://viral-vision.pages.dev/auth/callback
   ```
3. Click **Save**

### 4. ⚠️ Wrong API Key

**Double-check:**
- You're using the **anon public** key (not service_role)
- The key matches exactly what's in Supabase Dashboard
- No extra spaces or characters

## Quick Test

1. **Open browser console** (F12)
2. **Try signing up again**
3. **Check the error message** - it should now show more details
4. **Look for**:
   - "Invalid API key" → Wrong key or not set
   - "Email provider disabled" → Enable in Supabase
   - "Redirect URL not allowed" → Add to Supabase

## Step-by-Step Fix

### Step 1: Verify Environment Variables
```bash
# In Cloudflare Pages, check these exist:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 2: Enable Email Auth
- Supabase Dashboard → Authentication → Providers → Email → Enable

### Step 3: Add Redirect URLs
- Supabase Dashboard → Authentication → URL Configuration
- Add: `https://vvsprompts.com/auth/callback`

### Step 4: Redeploy
- After adding environment variables, trigger a new deployment

## Still Not Working?

Check the browser console for the detailed error message - I've updated the code to show more helpful errors.

