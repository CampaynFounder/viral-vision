# Stripe Security Fix - Private Key Exposure

## ⚠️ CRITICAL SECURITY ISSUE

If you're seeing your **private Stripe key** (starts with `sk_`) in the browser network requests, this is a **major security vulnerability**.

## What Happened

The request to `https://merchant-ui-api.stripe.com/elements/wallet-config` should **ONLY** use the publishable key (`pk_`), not the secret key (`sk_`).

## Root Cause

This typically happens when:
1. **Wrong key in environment variable**: You accidentally set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your secret key instead of publishable key
2. **Key format mismatch**: The key format doesn't match what Stripe expects

## ✅ IMMEDIATE FIX

### Step 1: Verify Your Environment Variables

Check your Cloudflare Pages environment variables:

**CORRECT:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # ✅ Starts with pk_
```

**WRONG:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sk_live_...  # ❌ Starts with sk_ (SECRET KEY!)
```

### Step 2: Get the Correct Publishable Key

1. Go to **Stripe Dashboard** → **Developers** → **API keys**
2. Find the **"Publishable key"** (starts with `pk_live_` or `pk_test_`)
3. **NOT** the "Secret key" (starts with `sk_`)

### Step 3: Update Cloudflare Pages

1. Go to Cloudflare Pages → Your Project
2. Settings → Environment Variables
3. Find `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. **Replace** with the publishable key (starts with `pk_`)
5. Save and redeploy

### Step 4: Rotate Your Secret Key (IMPORTANT!)

If your secret key was exposed:
1. Go to Stripe Dashboard → Developers → API keys
2. Click on your **Secret key**
3. Click **"Reveal test key"** or **"Reveal live key"**
4. Click **"Roll key"** to generate a new one
5. Update `STRIPE_SECRET_KEY` in Cloudflare Pages with the new key

## How to Verify It's Fixed

1. Open browser DevTools → Network tab
2. Go to checkout page
3. Look for request to `merchant-ui-api.stripe.com`
4. Check the payload - it should **ONLY** contain `pk_...` (publishable key)
5. **NO** `sk_...` (secret key) should appear

## Code Verification

The code correctly uses only the publishable key:

```typescript
// ✅ CORRECT - Only uses publishable key
const getStripeKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
};
```

**Secret key is ONLY used server-side:**
- `app/api/checkout/route.ts` - Server-side only
- `app/api/webhooks/stripe/route.ts` - Server-side only

## Prevention

1. **Never** use `NEXT_PUBLIC_` prefix for secret keys
2. **Always** verify the key starts with `pk_` for publishable keys
3. **Never** put secret keys (`sk_`) in client-side code
4. **Always** use environment variables, never hardcode keys

## Summary

- ✅ **Publishable key** (`pk_`) → Client-side (safe to expose)
- ❌ **Secret key** (`sk_`) → Server-side only (NEVER expose)
- ❌ **Webhook secret** (`whsec_`) → Server-side only (NEVER expose)

If you see `sk_` in browser requests, you've exposed your secret key and need to rotate it immediately!

