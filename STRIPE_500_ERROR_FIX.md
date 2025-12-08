# Fixing 500 Error on /api/create-payment-intent

## Issue
Getting a 500 Internal Server Error when trying to create a payment intent.

## Most Common Causes

### 1. Missing STRIPE_SECRET_KEY (Most Likely)
**Symptom**: 500 error with message "Stripe secret key not configured"

**Fix**:
1. Go to **Cloudflare Pages** → Your Project
2. **Settings** → **Environment Variables**
3. Add variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key (starts with `sk_live_` for production)
   - **Environment**: Production
4. **Save** and **Redeploy**

### 2. Invalid Stripe Secret Key
**Symptom**: 500 error with Stripe API error message

**Fix**:
1. Go to **Stripe Dashboard** → **Developers** → **API keys**
2. Make sure you're in **Live mode** (not Test mode)
3. Copy the **Secret key** (starts with `sk_live_`)
4. Update `STRIPE_SECRET_KEY` in Cloudflare Pages
5. **Redeploy**

### 3. Network/API Issues
**Symptom**: 500 error with network-related messages

**Fix**:
- Check Cloudflare Pages logs for detailed error messages
- Verify your Stripe account is active
- Check if there are any API rate limits

## How to Debug

### Check Cloudflare Pages Logs
1. Go to **Cloudflare Pages** → Your Project
2. **Deployments** → Latest deployment
3. Click **View Logs**
4. Look for error messages related to:
   - "Stripe secret key not configured"
   - Stripe API errors
   - Network errors

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to make a payment
4. Click on the `/api/create-payment-intent` request
5. Check the **Response** tab for error details

## Expected Behavior

### ✅ When Working:
- Status: `200 OK`
- Response contains: `{ clientSecret: "...", paymentIntentId: "..." }`

### ❌ When Not Working:
- Status: `500 Internal Server Error`
- Response contains: `{ error: "..." }` with specific error message

## Quick Checklist

- [ ] `STRIPE_SECRET_KEY` is set in Cloudflare Pages
- [ ] Key starts with `sk_live_` (for production)
- [ ] Key is set for **Production** environment
- [ ] Site has been **redeployed** after setting the key
- [ ] Stripe account is active and in Live mode

## Next Steps

1. **Set the environment variable** in Cloudflare Pages
2. **Redeploy** your site
3. **Test** the payment flow again
4. **Check logs** if it still fails

---

**The most common issue is that `STRIPE_SECRET_KEY` is not set in Cloudflare Pages environment variables!**

