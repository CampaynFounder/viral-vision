# Environment Variables Guide for Cloudflare Pages

## Complete List

### 🔵 PUBLIC Variables (NEXT_PUBLIC_*)
These are exposed to the browser - safe for public keys only.

### 🔴 SECRET Variables (No NEXT_PUBLIC_ prefix)
These are server-side only - never exposed to the browser.

---

## Supabase Variables

### 🔵 Public (Client-Side)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```
- **Purpose**: Client-side database access (browser)
- **Security**: Safe to expose (uses Row Level Security)
- **Where to get**: Supabase Dashboard → Settings → API

### 🔴 Secret (Server-Side Only)
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```
- **Purpose**: Admin operations (bypasses RLS)
- **Security**: ⚠️ KEEP SECRET - Never expose to client
- **Where to get**: Supabase Dashboard → Settings → API → service_role key

---

## Stripe Variables

### 🔵 Public (Client-Side)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
```
- **Purpose**: Client-side Stripe Elements (card input)
- **Security**: Safe to expose (public key)
- **Where to get**: Stripe Dashboard → Developers → API keys

### 🔴 Secret (Server-Side Only)
```bash
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```
- **Purpose**: 
  - `STRIPE_SECRET_KEY`: Create checkout sessions, process payments
  - `STRIPE_WEBHOOK_SECRET`: Verify webhook signatures
- **Security**: ⚠️ KEEP SECRET - Never expose to client
- **Where to get**: 
  - Secret key: Stripe Dashboard → Developers → API keys
  - Webhook secret: Stripe Dashboard → Developers → Webhooks → Add endpoint → Copy signing secret

---

## OpenAI Variables

### 🔴 Secret (Server-Side Only)
```bash
OPENAI_API_KEY=sk-...
```
- **Purpose**: Generate prompts using GPT-4o
- **Security**: ⚠️ KEEP SECRET - Never expose to client
- **Where to get**: OpenAI Platform → API keys → Create new secret key

---

## Optional: Analytics

### 🔵 Public (Client-Side)
```bash
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```
- **Purpose**: Google Analytics tracking
- **Security**: Safe to expose
- **Where to get**: Google Analytics → Admin → Data Streams

---

## How to Add to Cloudflare Pages

### Step 1: Go to Environment Variables
1. **Cloudflare Dashboard** → **Pages** → Your Project
2. **Settings** → **Environment Variables**

### Step 2: Add Each Variable
For each variable:
1. Click **Add variable**
2. Enter **Variable name** (exactly as shown above)
3. Enter **Value**
4. Select **Environment**: 
   - ✅ **Production** (for live site)
   - ✅ **Preview** (for preview deployments)
5. Click **Save**

### Step 3: Add All Variables

**Add these PUBLIC variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (optional)

**Add these SECRET variables:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`

### Step 4: Redeploy
After adding variables:
1. Go to **Deployments**
2. Click **Retry deployment** on latest deployment
3. Or push a new commit to trigger new deployment

---

## Quick Reference Table

| Variable | Type | Public/Secret | Where Used |
|----------|------|---------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | 🔵 Safe | Client-side Supabase calls |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | 🔵 Safe | Client-side Supabase calls |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | 🔴 Keep Secret | Server-side admin operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | 🔵 Safe | Stripe Elements (card input) |
| `STRIPE_SECRET_KEY` | Secret | 🔴 Keep Secret | API routes (checkout, webhooks) |
| `STRIPE_WEBHOOK_SECRET` | Secret | 🔴 Keep Secret | Webhook signature verification |
| `OPENAI_API_KEY` | Secret | 🔴 Keep Secret | API route (generate-prompt) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Public | 🔵 Safe | Google Analytics (optional) |

---

## Security Rules

### ✅ DO:
- Use `NEXT_PUBLIC_*` prefix for client-side variables
- Keep secret keys server-side only (no `NEXT_PUBLIC_` prefix)
- Add all variables to Cloudflare Pages (not in code)
- Use test keys (`pk_test_`, `sk_test_`) for development
- Use live keys (`pk_live_`, `sk_live_`) for production

### ❌ DON'T:
- Never commit `.env.local` to git
- Never expose secret keys to the browser
- Never use `NEXT_PUBLIC_` prefix for secret keys
- Never hardcode keys in your code

---

## Testing

After adding variables, test:
1. **Stripe**: Try checkout flow
2. **Supabase**: Try authentication
3. **OpenAI**: Try generating a prompt
4. **Webhooks**: Test payment webhook (use Stripe CLI locally)

---

## Need Help?

- **Supabase Setup**: See `SUPABASE_SETUP.md`
- **Stripe Setup**: See `PHASE2_SETUP.md` (Section 3)
- **OpenAI Setup**: See `PHASE2_SETUP.md` (Section 2)
- **Full Integration**: See `QUICK_START_PHASE2.md`

