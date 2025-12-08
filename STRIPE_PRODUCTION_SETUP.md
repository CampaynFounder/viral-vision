# Stripe Production Setup Guide

## ✅ Your Code is Production-Ready

The code automatically works with **live/production Stripe keys**. Stripe detects the mode based on your key prefix:

- **`pk_live_...` / `sk_live_...`** = **Production Mode** ✅
- **`pk_test_...` / `sk_test_...`** = Test Mode

## 🔑 Required Environment Variables

Make sure these are set in **Cloudflare Pages** with your **LIVE** keys:

### 1. Publishable Key (Client-Side)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
- Get from: Stripe Dashboard → Developers → API keys → **Publishable key** (Live mode)
- Must start with `pk_live_`

### 2. Secret Key (Server-Side)
```bash
STRIPE_SECRET_KEY=sk_live_...
```
- Get from: Stripe Dashboard → Developers → API keys → **Secret key** (Live mode)
- Must start with `sk_live_`
- ⚠️ **NEVER** expose this to the browser

### 3. Webhook Secret (Server-Side)
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```
- Get from: Stripe Dashboard → Developers → Webhooks → Your endpoint → Signing secret
- Required for verifying webhook signatures

## 📋 Setup Checklist

### Step 1: Get Live Keys from Stripe
1. Go to **Stripe Dashboard** → **Developers** → **API keys**
2. Make sure you're in **"Live mode"** (toggle in top right)
3. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Step 2: Set Up Production Webhook
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Make sure you're in **"Live mode"**
3. Click **"Add endpoint"**
4. **Endpoint URL**: `https://vvsprompts.com/api/webhooks/stripe`
5. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Step 3: Add to Cloudflare Pages
1. Go to **Cloudflare Pages** → Your Project
2. **Settings** → **Environment Variables**
3. Add/Update:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
4. Make sure all are set to **"Production"** environment
5. **Save** and **Redeploy**

## ✅ Verification

### Check 1: Verify Keys in Cloudflare
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_`
- [ ] `STRIPE_SECRET_KEY` starts with `sk_live_`
- [ ] `STRIPE_WEBHOOK_SECRET` starts with `whsec_`

### Check 2: Test Payment Flow
1. Go to checkout page
2. Use a **real card** (or Stripe test card `4242 4242 4242 4242` if still testing)
3. Complete payment
4. Check Stripe Dashboard → **Payments** to see the transaction

### Check 3: Verify Webhook
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Check **"Recent events"** - you should see events after payments

## 🚨 Important Notes

### Test vs Live Mode
- **Test mode**: Use `pk_test_` / `sk_test_` keys (for development)
- **Live mode**: Use `pk_live_` / `sk_live_` keys (for production) ✅
- The code automatically detects which mode based on key prefix

### Security
- ✅ **Publishable key** (`pk_live_`) is safe to expose (client-side)
- ❌ **Secret key** (`sk_live_`) must NEVER be exposed (server-side only)
- ❌ **Webhook secret** (`whsec_`) must NEVER be exposed (server-side only)

### Payment Processing
- **One-time payments** (Viral Starter, Empire Bundle): Processed immediately
- **Subscriptions** (CEO Access): Currently charges one-time, needs subscription API for recurring billing

## 🔄 Next Steps

1. **Set up live keys** in Cloudflare Pages
2. **Test with a real card** (small amount first!)
3. **Monitor Stripe Dashboard** for transactions
4. **Set up webhook** for payment confirmations
5. **Implement subscription handling** for CEO Access (recurring billing)

## 📞 Support

If payments aren't working:
1. Check browser console for errors
2. Check Stripe Dashboard → **Logs** for API errors
3. Verify environment variables are set correctly
4. Make sure you're using **live keys** (not test keys)

---

**Your code is ready for production!** Just make sure you're using `pk_live_` and `sk_live_` keys in Cloudflare Pages.

