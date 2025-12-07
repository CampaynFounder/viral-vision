# Stripe Keys Explained - Where to Find Each One

## The Three Stripe Keys You Need

### 1. 🔵 Publishable Key (Public - Safe to Expose)
**Location**: Stripe Dashboard → Developers → API keys → **Publishable key**

**Looks like**: `pk_live_...` or `pk_test_...`

**Environment Variable**: 
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Where it's used**: 
- Client-side (browser)
- Stripe Elements (card input component)
- Safe to expose to the browser

---

### 2. 🔴 Secret Key (Secret - Keep Private)
**Location**: Stripe Dashboard → Developers → API keys → **Secret key**

**Looks like**: `sk_live_...` or `sk_test_...`

**Environment Variable**:
```bash
STRIPE_SECRET_KEY=sk_live_...
```

**Where it's used**:
- Server-side only (API routes)
- Creating checkout sessions
- Processing payments
- ⚠️ Never expose to browser

---

### 3. 🔴 Webhook Secret (Secret - Keep Private)
**Location**: NOT in API keys! Created when you set up a webhook.

**Looks like**: `whsec_...`

**Environment Variable**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Where it's used**:
- Server-side only (webhook route)
- Verifying webhook signatures
- ⚠️ Never expose to browser

**How to get it**:
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter endpoint URL: `https://vvsprompts.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. **Copy the "Signing secret"** (starts with `whsec_`)
7. This is your `STRIPE_WEBHOOK_SECRET`

---

## What About "Restricted Key"?

**Restricted Key** is a newer Stripe feature that gives you more granular permissions. You don't need it for basic setup - the regular **Secret key** works fine.

**Use Secret Key** (not Restricted Key) for now.

---

## Summary Table

| Key Type | Location | Variable Name | Public/Secret |
|----------|----------|---------------|---------------|
| **Publishable** | API keys → Publishable key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 🔵 Public |
| **Secret** | API keys → Secret key | `STRIPE_SECRET_KEY` | 🔴 Secret |
| **Webhook Secret** | Webhooks → Endpoint → Signing secret | `STRIPE_WEBHOOK_SECRET` | 🔴 Secret |

---

## Step-by-Step: Getting Your Webhook Secret

### Step 1: Go to Webhooks
1. **Stripe Dashboard** → **Developers** (left sidebar)
2. Click **"Webhooks"**

### Step 2: Add Endpoint
1. Click **"+ Add endpoint"** button
2. **Endpoint URL**: `https://vvsprompts.com/api/webhooks/stripe`
3. **Description**: "Viral Vision Payment Webhooks" (optional)

### Step 3: Select Events
Select these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### Step 4: Create Endpoint
1. Click **"Add endpoint"**
2. You'll see the endpoint created
3. **Click on the endpoint** to view details

### Step 5: Copy Signing Secret
1. In the endpoint details, find **"Signing secret"**
2. Click **"Reveal"** or **"Copy"**
3. This is your `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

---

## Important Notes

### ❌ Publishable Key ≠ Webhook Secret
- **Publishable key** (`pk_...`) = Public key for client-side
- **Webhook secret** (`whsec_...`) = Secret for webhook verification
- They are **completely different** and serve different purposes

### ✅ For Now (Before Webhooks Are Set Up)
If you haven't set up the webhook yet, you can:
1. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (from API keys)
2. Add `STRIPE_SECRET_KEY` (from API keys)
3. Leave `STRIPE_WEBHOOK_SECRET` empty for now
4. Set up the webhook later when you're ready to test payments

### ⚠️ Security
- **Publishable key**: Safe to expose (goes in `NEXT_PUBLIC_*`)
- **Secret key**: Keep secret (no `NEXT_PUBLIC_` prefix)
- **Webhook secret**: Keep secret (no `NEXT_PUBLIC_` prefix)

---

## Quick Checklist

- [ ] Get **Publishable key** from API keys → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Get **Secret key** from API keys → `STRIPE_SECRET_KEY`
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Get **Webhook secret** from webhook endpoint → `STRIPE_WEBHOOK_SECRET`
- [ ] Add all three to Cloudflare Pages environment variables

---

## Need Help?

- **Setting up webhook**: See `PHASE2_SETUP.md` (Section 3, Step 3)
- **Testing webhooks locally**: Use Stripe CLI
- **Stripe Dashboard**: https://dashboard.stripe.com

