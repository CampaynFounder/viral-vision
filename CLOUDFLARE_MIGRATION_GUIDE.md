# Migration Guide: Next.js 15 for Cloudflare Pages

## What Changed

### 1. Downgraded Dependencies
- **Next.js**: 16.0.7 → 15.5.2 (Cloudflare compatible)
- **React**: 19.2.1 → 18.3.1 (Next.js 15 uses React 18)
- **TypeScript types**: Updated to match React 18

### 2. Added Cloudflare Adapter
- **@cloudflare/next-on-pages**: Added as dev dependency
- This adapter makes Next.js work on Cloudflare Pages

### 3. Updated Build Script
- Added `pages:build` script for Cloudflare deployment

## Next Steps

### Step 1: Install Updated Dependencies
```bash
npm install
```

This will:
- Downgrade Next.js to 15.5.2
- Downgrade React to 18.3.1
- Install @cloudflare/next-on-pages adapter

### Step 2: Test Locally
```bash
npm run dev
```

Make sure everything still works. The code should be compatible since we're not using Next.js 16-specific features.

### Step 3: Update Cloudflare Pages Settings

1. **Cloudflare Pages** → Your Project → **Settings** → **Builds & deployments**
2. **Build command**: Change to `npm run pages:build`
3. **Build output directory**: Set to `.vercel/output/static`
4. **Save**

### Step 4: Deploy
1. Commit and push the changes
2. Cloudflare will auto-deploy
3. Should work now!

## What Features Still Work

✅ **App Router** - Fully supported in Next.js 15
✅ **API Routes** - Work with Cloudflare adapter
✅ **Server Components** - Supported
✅ **Client Components** - Supported
✅ **All your code** - Should work as-is

## What We're Not Losing

- App Router structure ✅
- API routes ✅
- All components ✅
- All functionality ✅

The only difference is React 18 instead of 19, which is fully compatible.

## Why This Works

Next.js 15.5.2 is the latest version supported by `@cloudflare/next-on-pages`. This adapter:
- Converts Next.js App Router to Cloudflare Pages format
- Handles API routes as Cloudflare Functions
- Makes everything work on Cloudflare's edge network

## After Migration

1. **Test locally** - `npm run dev`
2. **Build test** - `npm run pages:build` (should create `.vercel/output/static`)
3. **Update Cloudflare settings** - Use new build command
4. **Deploy** - Should work!

Let me know when you've run `npm install` and we can test the build!

