# Downgrade to Next.js 15 for Cloudflare Compatibility

## Why This Is Needed
You're right - we should have checked Cloudflare compatibility first. Next.js 16 isn't supported on Cloudflare Pages yet. The `@cloudflare/next-on-pages` adapter supports Next.js 15.5.2.

## What We Need to Change

### Step 1: Downgrade Next.js and React
Update `package.json` dependencies:

```json
{
  "dependencies": {
    "next": "^15.5.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### Step 2: Install Cloudflare Adapter
```bash
npm install -D @cloudflare/next-on-pages
```

### Step 3: Update Build Script
Add Cloudflare build command:

```json
{
  "scripts": {
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages"
  }
}
```

### Step 4: Update Cloudflare Build Command
In Cloudflare Pages settings:
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`

### Step 5: Check for Next.js 16-Only Features
We need to verify we're not using Next.js 16-specific features that won't work in 15.

## What Features Might Break

### Next.js 16 Features We Might Be Using:
- React 19 (Next.js 15 uses React 18)
- New App Router features
- Server Actions (if we use them)
- New caching strategies

### What Should Still Work:
- App Router ✅
- API Routes ✅
- Server Components ✅
- Client Components ✅
- All our current code ✅

## Migration Steps

1. **Update package.json** - Downgrade Next.js and React
2. **Install adapter** - `@cloudflare/next-on-pages`
3. **Update build command** - Use adapter
4. **Test locally** - Make sure everything works
5. **Deploy to Cloudflare** - Should work now

Let me create the updated package.json and configuration files.

