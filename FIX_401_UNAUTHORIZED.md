# Fix: 401 Unauthorized Error on Sign Up

## The Error
```
POST https://xxx.supabase.co/auth/v1/signup
Status Code: 401 Unauthorized
```

## Common Causes & Solutions

### 1. ✅ Check Environment Variables

**Make sure these are set in Cloudflare Pages:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Verify:**
1. Cloudflare Pages → Your Project → Settings → Environment Variables
2. Check both variables are set for **Production** environment
3. Make sure values are correct (no extra spaces, full keys)

### 2. ✅ Enable Email Authentication in Supabase

**In Supabase Dashboard:**
1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **Enabled**
4. Check **"Confirm email"** settings:
   - If enabled: Users must click email link
   - If disabled: Users can sign in immediately

### 3. ✅ Check Redirect URL Configuration

**In Supabase Dashboard:**
1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://vvsprompts.com/auth/callback`
   - `https://viral-vision.pages.dev/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

### 4. ✅ Verify API Keys

**Check the keys match:**
1. Supabase Dashboard → **Settings** → **API**
2. Compare:
   - **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. ✅ Check Email Settings

**In Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates**
2. Make sure email sending is configured
3. Check if you're using:
   - Supabase's built-in email (free tier)
   - Custom SMTP (if configured)

### 6. ✅ Check Rate Limiting

**If you see rate limit errors:**
- Supabase free tier has rate limits
- Wait a few minutes and try again
- Check Supabase dashboard for rate limit status

## Quick Debug Steps

### Step 1: Check Browser Console
Open browser DevTools → Console tab
- Look for any error messages
- Check if environment variables are loading

### Step 2: Verify Keys in Code
Add temporary console.log (remove after testing):
```typescript
// In app/auth/page.tsx, add at top of handleSubmit:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### Step 3: Test with Supabase Dashboard
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Try creating a user manually
3. If that works, the issue is with the API keys in your app

### Step 4: Check Network Tab
1. Open DevTools → **Network** tab
2. Try signing up again
3. Click on the failed request
4. Check:
   - **Request Headers** - Is the API key being sent?
   - **Response** - What's the exact error message?

## Most Likely Issues

### Issue 1: Environment Variables Not Set
**Solution:** Add them to Cloudflare Pages and redeploy

### Issue 2: Wrong API Key
**Solution:** Double-check you copied the **anon public** key (not service_role)

### Issue 3: Email Provider Disabled
**Solution:** Enable Email provider in Supabase Dashboard

### Issue 4: Redirect URL Not Allowed
**Solution:** Add redirect URLs to Supabase allowed list

## Testing Checklist

- [ ] Environment variables set in Cloudflare Pages
- [ ] Supabase project is active
- [ ] Email provider is enabled
- [ ] Redirect URLs are configured
- [ ] API keys match Supabase dashboard
- [ ] No rate limiting errors
- [ ] Redeployed after adding environment variables

## Next Steps

1. **Check Cloudflare Pages environment variables** (most common issue)
2. **Verify Supabase Email provider is enabled**
3. **Add redirect URLs to Supabase**
4. **Redeploy** if you just added environment variables
5. **Check browser console** for detailed error messages

Let me know what you find and I can help debug further!

