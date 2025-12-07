# Quick Start: Phase 2 Integration

## You Have:
- ✅ OpenAI API key
- ✅ Stripe keys (publishable + secret)
- ⏳ Need: Supabase project

## Quick Setup (15 minutes)

### 1. Create Supabase Project (5 min)
1. Go to https://app.supabase.com → New Project
2. Name: `viral-vision`
3. Copy these 3 values:
   - Project URL
   - anon public key
   - service_role key

### 2. Set Up Database (2 min)
1. In Supabase: SQL Editor
2. Copy/paste `lib/db/schema.sql`
3. Run it

### 3. Create Stripe Products (5 min)
1. Go to Stripe Dashboard → Products
2. Create 3 products:
   - Viral Starter: $27 one-time
   - CEO Access: $47/month
   - Empire Bundle: $97 one-time
3. Copy Price IDs (starts with `price_`)

### 4. Set Up Stripe Webhook (3 min)
1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://vvsprompts.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook secret (starts with `whsec_`)

### 5. Add Environment Variables to Cloudflare (2 min)
1. Cloudflare Pages → Your Project → Settings → Environment Variables
2. Add these:

```
OPENAI_API_KEY=sk-your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## Next Steps
1. Update `lib/constants/pricing.ts` with Stripe Price IDs
2. Implement API routes (see `PHASE2_SETUP.md`)
3. Test in preview deployment
4. Deploy to production

## Need Help?
See `PHASE2_SETUP.md` for detailed instructions.

