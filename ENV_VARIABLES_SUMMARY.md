# Environment Variables Summary for vvsprompts.com

## ✅ What You Have
- OpenAI API key
- Stripe keys (publishable + secret)

## ⏳ What You Need
- Supabase project (for authentication + database)

## 📋 Complete Environment Variables List

### Required for Phase 2

```bash
# OpenAI (You Have ✅)
OPENAI_API_KEY=sk-your-key-here

# Stripe (You Have ✅)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe webhook setup

# Supabase (You Need ⏳)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Optional (Analytics)
```bash
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🚀 Quick Setup Steps

### 1. Create Supabase Project (5 minutes)
1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: `viral-vision`
4. Choose region
5. Set database password (save it!)
6. Wait for project creation

### 2. Get Supabase Keys
1. In Supabase dashboard: Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Up Database
1. In Supabase: SQL Editor
2. Copy/paste contents of `lib/db/schema.sql`
3. Click "Run"
4. Verify tables created

### 4. Set Up Stripe Webhook
1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://vvsprompts.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 5. Create Stripe Products
Create 3 products in Stripe Dashboard:
- **Viral Starter**: $27 one-time → Get Price ID
- **CEO Access**: $47/month → Get Price ID  
- **Empire Bundle**: $97 one-time → Get Price ID

### 6. Add to Cloudflare Pages
1. Cloudflare Pages → Your Project
2. Settings → Environment Variables
3. Add all variables above
4. Set for **Production** environment

## 📝 Notes

- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
- Variables WITHOUT `NEXT_PUBLIC_` are server-side only (keep secret!)
- Never commit `.env.local` to git
- Use test keys (`pk_test_`, `sk_test_`) for development
- Use live keys (`pk_live_`, `sk_live_`) for production

## 🔐 Security Checklist

- [ ] All server-side keys are NOT in `NEXT_PUBLIC_*`
- [ ] Stripe webhook secret is set
- [ ] Supabase service role key is kept secret
- [ ] OpenAI API key is server-side only
- [ ] Environment variables set in Cloudflare (not in code)

## 📚 Full Documentation

- **Quick Start**: See `QUICK_START_PHASE2.md`
- **Detailed Guide**: See `PHASE2_SETUP.md`
- **Environment Template**: See `.env.example`

