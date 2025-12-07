# Fix: Cloudflare Pages Setting Output to Vercel

## The Problem
When you set Node.js version, Cloudflare Pages is automatically setting output directory to "vercel" - this is wrong!

## The Fix

### Step 1: Set Framework Preset First
1. Cloudflare Pages → Your Project → **Settings** → **Builds & deployments**
2. **Framework preset**: Select **"Next.js"** (NOT "Vercel" or auto-detect)
3. This should automatically:
   - Set correct build command
   - Set correct output directory (blank or `.next`)
   - Configure for Next.js properly

### Step 2: Clear/Reset Output Directory
1. After setting Framework preset to "Next.js"
2. **Build output directory**: Should be **blank** (or `.next`)
3. If it shows "vercel", **clear it** or change to blank
4. Save

### Step 3: Set Node.js Version (After Framework)
1. **Node.js version**: Set to `20` (or `18`)
2. After setting, **check Build output directory again**
3. If it changed back to "vercel", **clear it** and set to blank
4. Save

## Correct Settings for Cloudflare Pages

```
Framework preset: Next.js
Build command: npm run build
Build output directory: (blank) or .next
Root directory: (blank)
Node.js version: 20 (or 18)
```

## Why This Happens

Cloudflare Pages sometimes auto-detects Vercel configuration if:
- It sees `vercel.json` (you don't have this ✅)
- It detects Next.js but assumes Vercel deployment
- Node.js version setting triggers Vercel mode

**Solution**: Explicitly set Framework preset to "Next.js" BEFORE setting Node.js version.

## Step-by-Step Fix

1. **Go to Settings → Builds & deployments**
2. **Framework preset**: Change to **"Next.js"** (if it's on Vercel or auto)
3. **Build output directory**: Make sure it's **blank** (clear if it says "vercel")
4. **Build command**: Should be `npm run build` (auto-set by framework preset)
5. **Node.js version**: Set to `20`
6. **After setting Node.js, check output directory again** - if it changed to "vercel", clear it
7. **Save**
8. **Go to Deployments → Retry deployment**

## Alternative: Manual Override

If the framework preset keeps resetting:

1. **Framework preset**: Leave as "None" or "Other"
2. **Build command**: `npm run build`
3. **Build output directory**: Leave **blank** (don't set to vercel)
4. **Node.js version**: `20`
5. **Save and deploy**

## Verify It's Fixed

After updating settings:
1. Check **Build output directory** is blank (not "vercel")
2. Trigger a new deployment
3. Check build logs - should show Next.js build process
4. Test site - should work now

## Key Point

**Cloudflare Pages ≠ Vercel**

- Vercel uses different output format
- Cloudflare Pages needs standard Next.js output
- Framework preset "Next.js" tells Cloudflare to use correct format
- Output directory should be blank for standard Next.js

Try setting Framework preset to "Next.js" first, then Node.js version, and make sure output directory stays blank!

