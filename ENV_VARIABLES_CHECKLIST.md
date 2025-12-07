# Environment Variables Checklist

## ⚠️ Important: Database Password vs API Keys

**You do NOT need the database password as an environment variable!**

- **Database Password**: Only used when creating the Supabase project (you set it once)
- **API Keys**: These are what your app actually uses (environment variables)

---

## ✅ Complete Environment Variables List

### Supabase (3 variables needed)

#### 🔵 Public (Client-Side)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### 🔴 Secret (Server-Side)
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Where to get:**
1. Go to Supabase Dashboard → Your Project
2. Settings → API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Stripe (3 variables needed)

#### 🔵 Public (Client-Side)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
```

#### 🔴 Secret (Server-Side)
```bash
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Where to get:**
- Publishable & Secret: Stripe Dashboard → Developers → API keys
- Webhook Secret: Stripe Dashboard → Developers → Webhooks → Your endpoint → Signing secret

---

### OpenAI (1 variable needed)

#### 🔴 Secret (Server-Side)
```bash
OPENAI_API_KEY=sk-...
```

**Where to get:**
- OpenAI Platform → API keys → Create new secret key

---

## 📋 Quick Checklist

### Supabase
- [ ] Created Supabase project (you set database password here - save it for project access)
- [ ] Got `NEXT_PUBLIC_SUPABASE_URL` from Settings → API
- [ ] Got `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Settings → API
- [ ] Got `SUPABASE_SERVICE_ROLE_KEY` from Settings → API

### Stripe
- [ ] Got `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from API keys
- [ ] Got `STRIPE_SECRET_KEY` from API keys
- [ ] Set up webhook endpoint
- [ ] Got `STRIPE_WEBHOOK_SECRET` from webhook endpoint

### OpenAI
- [ ] Got `OPENAI_API_KEY` from OpenAI Platform

---

## 🚀 Add to Cloudflare Pages

1. **Cloudflare Dashboard** → **Pages** → Your Project
2. **Settings** → **Environment Variables**
3. Add each variable:
   - Variable name (exactly as shown)
   - Value
   - Environment: **Production** and **Preview**
4. **Save**
5. **Redeploy**

---

## ❌ What You DON'T Need

- ❌ Database password (not an environment variable)
- ❌ Database connection string (Supabase uses API keys)
- ❌ Direct database credentials (handled by Supabase)

---

## ✅ What You DO Need

- ✅ 3 Supabase API keys (URL, anon key, service role key)
- ✅ 3 Stripe keys (publishable, secret, webhook secret)
- ✅ 1 OpenAI API key

**Total: 7 environment variables**

---

## 🔐 Security Reminder

- `NEXT_PUBLIC_*` = Safe to expose (public keys)
- No prefix = Secret (server-side only, never expose)

---

## Need Help?

- **Supabase Setup**: See `SUPABASE_SETUP.md`
- **Stripe Setup**: See `STRIPE_KEYS_EXPLAINED.md`
- **All Variables**: See `ENVIRONMENT_VARIABLES_GUIDE.md`

