# Where to Find Preview Environment in Cloudflare Pages

## Location

The **Preview environment** is in the same place as the **Production environment**:

### Step-by-Step

1. **Cloudflare Dashboard** → **Pages** → Your Project (`viral-vision`)

2. Click **Settings** (gear icon in the top right of the project page)

3. Scroll down to the **Functions** section

4. Click **Compatibility Flags**

5. You'll see **TWO sections** side by side or stacked:
   - **Production environment** (left/top)
   - **Preview environment** (right/bottom)

## Visual Layout

```
Settings → Functions → Compatibility Flags
├── Production environment
│   └── [Add compatibility flag button]
│   └── nodejs_compat
│
└── Preview environment
    └── [Add compatibility flag button]
    └── nodejs_compat
```

## If You Don't See Preview Environment

If you only see **Production environment**:

1. **Check if you're in the right place**: Make sure you're in **Settings** → **Functions** → **Compatibility Flags**

2. **It might be collapsed**: Look for a dropdown or expandable section

3. **It might be below**: Scroll down - Preview environment is usually below Production

4. **Alternative location**: Sometimes it's under **Builds & deployments** → **Environment variables** → **Compatibility Flags**

## Quick Path

```
Pages → viral-vision → Settings → Functions → Compatibility Flags
```

Both environments should be visible on the same page. If you only see Production, scroll down or look for a tab/expandable section.

## What to Do

1. Add `nodejs_compat` to **Production environment**
2. Add `nodejs_compat` to **Preview environment** (same page, just below or to the right)
3. Save both
4. Redeploy

The Preview environment is for preview deployments (like pull requests), while Production is for your main branch deployments.

