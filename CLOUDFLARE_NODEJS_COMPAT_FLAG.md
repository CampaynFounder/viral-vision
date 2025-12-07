# Fix: Cloudflare Pages nodejs_compat Compatibility Flag

## The Error
```
no nodejs_compat compatibility flag set
503 error
```

## The Solution

You need to add the `nodejs_compat` compatibility flag in Cloudflare Pages settings.

## Step-by-Step Instructions

### Step 1: Go to Compatibility Flags Settings

1. **Cloudflare Dashboard** → **Pages** → Your Project (`viral-vision`)
2. Click **Settings** (gear icon in the top right)
3. Scroll down to **Functions** section
4. Click **Compatibility Flags**

### Step 2: Add nodejs_compat Flag

1. You'll see two sections:
   - **Production environment**
   - **Preview environment**

2. For **BOTH** environments:
   - Click **Add compatibility flag**
   - Type: `nodejs_compat`
   - Click **Save**

### Step 3: Redeploy

After adding the flag:
1. Go to **Deployments**
2. Click **Retry deployment** on the latest deployment
   - OR
3. Push a new commit to trigger a new deployment

## Visual Guide

```
Cloudflare Pages → Your Project → Settings
  ↓
Functions section
  ↓
Compatibility Flags
  ↓
Production environment: Add "nodejs_compat"
Preview environment: Add "nodejs_compat"
  ↓
Save
  ↓
Redeploy
```

## Why This Is Needed

Next.js requires Node.js APIs (like `fs`, `path`, etc.) to run. Cloudflare Workers/Pages runs on V8 (not Node.js), so the `nodejs_compat` flag enables Node.js compatibility layer.

## After Adding the Flag

Your site should work! The 503 error will be resolved once:
1. ✅ Flag is added to both environments
2. ✅ Site is redeployed

## Quick Checklist

- [ ] Go to Pages → Settings → Functions → Compatibility Flags
- [ ] Add `nodejs_compat` to Production environment
- [ ] Add `nodejs_compat` to Preview environment
- [ ] Save
- [ ] Redeploy (retry latest deployment or push new commit)

That's it! Your site should work after this.

