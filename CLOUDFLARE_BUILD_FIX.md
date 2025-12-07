# Fix: Cloudflare Pages "Missing script: pages:build"

## The Issue
Cloudflare is saying the `pages:build` script doesn't exist, even though it's in `package.json`.

## Possible Causes

1. **Cloudflare is building from wrong commit/branch**
2. **Cached build environment**
3. **package.json not being read correctly**

## Solutions

### Solution 1: Use Direct Command (Quick Fix)

Instead of using the script, use the command directly:

**In Cloudflare Pages Settings:**
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`

This bypasses the script entirely.

### Solution 2: Verify Cloudflare is Using Latest Commit

1. **Cloudflare Pages** → Your Project → **Deployments**
2. Check which commit is being built
3. Should be: `f2d61a5` (Move @cloudflare/next-on-pages to dependencies)
4. If it's an older commit, trigger a new deployment

### Solution 3: Clear Build Cache

1. **Cloudflare Pages** → Your Project → **Settings** → **Builds & deployments**
2. Look for **"Clear build cache"** or **"Retry deployment"**
3. This forces a fresh build

### Solution 4: Check Branch

1. **Cloudflare Pages** → Your Project → **Settings** → **Builds & deployments**
2. Verify **Production branch** is set to `main`
3. Make sure you pushed to `main` branch

## Recommended: Use Direct Command

**Update Cloudflare Pages Settings:**

```
Build command: npx @cloudflare/next-on-pages
Build output directory: .vercel/output/static
Build system version: 3
Root directory: /
```

This should work immediately without relying on the npm script.

## Why This Happens

Sometimes Cloudflare's build environment:
- Uses cached package.json
- Builds from wrong branch
- Has npm script resolution issues

Using the direct command bypasses all of these issues.

