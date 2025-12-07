# Manual Cloudflare Pages Configuration (Framework Preset Not Sticking)

## The Problem
Framework preset keeps getting removed when you save. This happens sometimes with Cloudflare Pages.

## Solution: Manual Configuration

Since the framework preset won't stick, configure everything manually:

### Step 1: Clear Framework Preset
1. Cloudflare Pages → Your Project → **Settings** → **Builds & deployments**
2. **Framework preset**: Set to **"None"** or **"Other"** (or leave as is)
3. Don't worry if it keeps resetting - we'll configure manually

### Step 2: Set Build Command
1. **Build command**: `npm run build`
2. Make sure this is set correctly

### Step 3: Set Build Output Directory
1. **Build output directory**: Leave **completely blank** (empty)
2. **Do NOT** set it to "vercel" or anything else
3. If it auto-fills, clear it

### Step 4: Set Node.js Version
1. **Node.js version**: `20` (or `18`)
2. After setting, **immediately check Build output directory**
3. If it changed to "vercel", **clear it back to blank**
4. Save

### Step 5: Root Directory
1. **Root directory**: Leave **blank** (unless your Next.js app is in a subdirectory)

## Final Manual Settings

```
Framework preset: None/Other (ignore this)
Build command: npm run build
Build output directory: (blank/empty) ← Critical!
Root directory: (blank)
Node.js version: 20
```

## Why This Works

Cloudflare Pages can auto-detect Next.js even without the framework preset if:
- Build command is `npm run build`
- Output directory is blank (Next.js default)
- Project has `package.json` with Next.js

## Alternative: Check for Configuration Files

Sometimes Cloudflare reads config from files. Check if you have:

1. **`vercel.json`** - Delete if exists (causes Vercel mode)
2. **`.vercel` folder** - Delete if exists
3. **`netlify.toml`** - Shouldn't affect but check

## Verify Build Works

After manual configuration:

1. **Save settings**
2. **Go to Deployments → Retry deployment** (or push to GitHub)
3. **Check build logs**:
   - Should show: "Installing dependencies"
   - Should show: "Running npm run build"
   - Should show: "Next.js build output"
4. **Look for errors** in logs

## If Still 404 After Manual Config

Check build logs for:
- ✅ Build completes successfully
- ✅ Files are being deployed
- ✅ No errors about missing files
- ✅ Next.js routes are detected

If build succeeds but still 404, it might be:
- Caching issue (wait 5-10 minutes)
- Domain routing issue (check Custom Domains)
- Need to clear Cloudflare cache

## Quick Test

After deployment, try accessing:
- `https://[your-project].pages.dev` (direct Pages URL)
- If that works but `vvsprompts.com` doesn't, it's a domain routing issue
- If both 404, it's a build issue

## Key Points

1. **Ignore framework preset** - configure manually
2. **Build output directory MUST be blank** - not "vercel"
3. **Build command**: `npm run build`
4. **Node.js version**: 20
5. **Save and redeploy**

Try this manual configuration and let me know what the build logs show!

