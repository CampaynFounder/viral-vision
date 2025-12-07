# Phase 2 Integration Setup Guide

## Overview
This guide walks you through setting up all the backend integrations for Viral Vision.

## Prerequisites
- ✅ OpenAI API key
- ✅ Stripe keys (publishable + secret)
- ⏳ Supabase project (needs to be created)

---

## 1. Supabase Setup (Authentication + Database)

### Step 1: Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: `viral-vision` (or your choice)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Step 2: Get Supabase Keys
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 3: Set Up Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `lib/db/schema.sql`
3. Paste and run the SQL script
4. This creates:
   - `users` table
   - `credits` table
   - `subscriptions` table
   - `prompts` table
   - `prompt_history` table
   - Row Level Security (RLS) policies

### Step 4: Configure Authentication
1. Go to Authentication → Providers
2. Enable **Email** provider (default)
3. (Optional) Enable **Google** or **GitHub** for social login
4. Configure email templates if needed

### Step 5: Set Up Row Level Security (RLS)
The schema.sql already includes RLS policies, but verify:
1. Go to Authentication → Policies
2. Ensure policies are active:
   - Users can only see their own data
   - Public prompts are readable by all
   - Private prompts are user-only

---

## 2. OpenAI Setup

### Step 1: Get API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: `viral-vision-production`
4. Copy the key (starts with `sk-`)
5. ⚠️ **Save it immediately** - you won't see it again!

### Step 2: Set Usage Limits (Recommended)
1. Go to Settings → Limits
2. Set monthly spending limit (e.g., $100)
3. Set per-request limit if needed

### Step 3: Test the Key
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

---

## 3. Stripe Setup

### Step 1: Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy:
   - **Publishable key** (starts with `pk_live_` or `pk_test_`)
   - **Secret key** (starts with `sk_live_` or `sk_test_`)

### Step 2: Create Products
1. Go to Products → Add Product
2. Create these products:

**Product 1: Viral Starter**
- Name: "Viral Starter - 50 Prompt Vault"
- Price: $27.00
- Type: One-time payment
- Copy the **Price ID** (starts with `price_`)

**Product 2: CEO Access**
- Name: "CEO Access - Monthly Subscription"
- Price: $47.00/month
- Type: Recurring (monthly)
- Copy the **Price ID**

**Product 3: Empire Bundle**
- Name: "Empire Bundle - 100 Credits + Reseller Kit"
- Price: $97.00
- Type: One-time payment
- Copy the **Price ID**

### Step 3: Set Up Webhooks
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://vvsprompts.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 4: Update Code with Price IDs
You'll need to map product IDs to Stripe Price IDs in:
- `lib/constants/pricing.ts` (add `stripePriceId` field)
- `app/api/checkout/route.ts` (use Price IDs when creating sessions)

---

## 4. Google Analytics 4 (Optional)

### Step 1: Create GA4 Property
1. Go to https://analytics.google.com
2. Create new property: "Viral Vision"
3. Set up data stream for Web
4. Copy **Measurement ID** (starts with `G-`)

### Step 2: Set Up Events
The code already tracks these events:
- `generate_prompt`
- `begin_checkout`
- `purchase`
- `copy_prompt`
- `export_portfolio`

### Step 3: Set Up Conversions
1. Go to Admin → Events
2. Mark `purchase` as conversion event
3. Set up funnel: Landing → Generate → Checkout → Purchase

---

## 5. Environment Variables Setup

### Local Development (.env.local)
Create `.env.local` file in project root:
```bash
cp .env.example .env.local
# Then edit .env.local with your actual keys
```

### Cloudflare Pages
1. Go to Cloudflare Pages dashboard
2. Select your project: `viral-vision`
3. Go to Settings → Environment Variables
4. Add all variables from `.env.example`
5. Set for **Production** environment
6. (Optional) Add different values for **Preview** environment

**Important Variables:**
- `OPENAI_API_KEY` - Server-side only (not exposed to client)
- `STRIPE_SECRET_KEY` - Server-side only
- `STRIPE_WEBHOOK_SECRET` - Server-side only
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side only
- `NEXT_PUBLIC_*` - Exposed to client (safe to be public)

---

## 6. Code Updates Needed

### Update Pricing Constants
Edit `lib/constants/pricing.ts`:
```typescript
export interface PricingTier {
  // ... existing fields
  stripePriceId: string; // Add this
}

export const pricingTiers: PricingTier[] = [
  {
    id: "viral-starter",
    stripePriceId: "price_xxxxx", // From Stripe
    // ... rest of config
  },
  // ... other tiers
];
```

### Implement API Routes
1. **`app/api/generate-prompt/route.ts`**
   - Replace mock with OpenAI API call
   - Use GPT-4o model
   - Implement prompt engineering logic

2. **`app/api/checkout/route.ts`**
   - Initialize Stripe with secret key
   - Create checkout session with Price IDs
   - Set success/cancel URLs

3. **`app/api/webhooks/stripe/route.ts`**
   - Verify webhook signature
   - Handle payment events
   - Update user credits/subscription in Supabase

### Add Supabase Client
Create `lib/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Replace localStorage with Supabase
- Update credit tracking to use Supabase
- Replace prompt history with database
- Add user authentication flow

---

## 7. Testing Checklist

### Supabase
- [ ] Database schema created
- [ ] RLS policies active
- [ ] Authentication works
- [ ] Can create/read user data

### OpenAI
- [ ] API key works
- [ ] Prompt generation returns results
- [ ] Error handling works
- [ ] Rate limits handled

### Stripe
- [ ] Test checkout flow works
- [ ] Webhooks receive events
- [ ] Payment processing works
- [ ] Subscription management works

### Integration
- [ ] User signs up → credits created
- [ ] Payment → credits updated
- [ ] Prompt generation → saved to database
- [ ] Analytics tracking works

---

## 8. Security Checklist

- [ ] All server-side keys are NOT in `NEXT_PUBLIC_*`
- [ ] Stripe webhook signature verified
- [ ] Supabase RLS policies tested
- [ ] API routes have error handling
- [ ] Rate limiting implemented (if needed)
- [ ] Input validation on all forms
- [ ] CORS configured properly

---

## 9. Deployment Steps

1. **Set Environment Variables in Cloudflare**
   - Add all keys from `.env.example`
   - Verify production vs preview environments

2. **Test in Preview**
   - Create preview deployment
   - Test all flows
   - Verify API calls work

3. **Deploy to Production**
   - Push to main branch
   - Monitor deployment logs
   - Test live site

4. **Monitor**
   - Check Stripe dashboard for payments
   - Check Supabase logs for errors
   - Monitor OpenAI usage
   - Check GA4 for traffic

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages

---

## Quick Reference: What Each Service Does

| Service | Purpose | Key Location |
|---------|---------|--------------|
| **Supabase** | Auth, Database, Credits | `lib/db/schema.sql` |
| **OpenAI** | Prompt Generation | `app/api/generate-prompt/route.ts` |
| **Stripe** | Payments, Subscriptions | `app/api/checkout/route.ts` |
| **GA4** | Analytics, Tracking | `lib/utils/analytics.ts` |

