# Cloudflare Pages Deployment Checklist for vvsprompts.com

## ✅ Configuration Status

### Build Settings
- **Framework**: Next.js 16+ (App Router)
- **Build Command**: `npm run build`
- **Build Output Directory**: `.next` (Next.js default)
- **Node Version**: 18+ (Cloudflare Pages supports Node.js 18+)

### Next.js Configuration
- ✅ React Strict Mode enabled
- ✅ TypeScript configured
- ✅ Tailwind CSS configured
- ✅ PWA manifest configured

## 🔧 Required Cloudflare Pages Settings

### 1. Build Configuration
In Cloudflare Pages dashboard, set:
- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (if repo is at root)

### 2. Environment Variables
Set these in Cloudflare Pages → Settings → Environment Variables:

#### Required (Phase 2 - Optional for MVP):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Optional (Phase 2):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
OPENAI_API_KEY=sk-...
```

### 3. Domain Configuration
- ✅ Domain: `vvsprompts.com`
- ✅ SSL/TLS: Automatic (Cloudflare handles this)
- ✅ HTTPS: Enabled by default

## ⚠️ Issues to Address

### 1. Missing PWA Icons
The manifest references icons that don't exist:
- `/public/icon-192.png` - Missing
- `/public/icon-512.png` - Missing

**Action Required**: 
- Create 192x192 and 512x512 PNG icons
- Add to `/public` directory
- Commit and push

### 2. Cloudflare Pages Compatibility
Next.js 16 uses the App Router which requires:
- ✅ Node.js 18+ (Cloudflare Pages supports this)
- ✅ Edge Runtime compatibility (API routes may need adjustment)

### 3. API Routes
Your API routes (`/api/*`) are server-side rendered:
- ✅ Cloudflare Pages supports Next.js API routes
- ⚠️ Ensure they're configured for Edge Runtime if needed

## 📋 Pre-Deployment Checklist

- [ ] Add PWA icons (icon-192.png, icon-512.png)
- [ ] Set environment variables in Cloudflare dashboard
- [ ] Verify build succeeds locally (`npm run build`)
- [ ] Test production build locally (`npm run build && npm start`)
- [ ] Verify domain DNS is pointing to Cloudflare
- [ ] Check SSL certificate is active
- [ ] Test PWA installation on mobile
- [ ] Verify analytics tracking (if GA4 is configured)

## 🚀 Deployment Steps

1. **Connect Repository**
   - Go to Cloudflare Pages dashboard
   - Connect GitHub repository: `CampaynFounder/viral-vision`
   - Select branch: `main`

2. **Configure Build**
   - Framework: Next.js
   - Build command: `npm run build`
   - Build output: `.next`

3. **Set Environment Variables**
   - Add all required env vars in Cloudflare dashboard
   - Use production keys (not test keys)

4. **Deploy**
   - Cloudflare will auto-deploy on push to `main`
   - Or trigger manual deployment

5. **Custom Domain**
   - Add `vvsprompts.com` in Cloudflare Pages
   - Update DNS records if needed
   - Wait for SSL certificate provisioning

## 🔍 Post-Deployment Verification

1. **Accessibility**
   - [ ] Site loads at https://vvsprompts.com
   - [ ] HTTPS redirects working
   - [ ] All pages accessible

2. **Functionality**
   - [ ] Landing page loads
   - [ ] Generate flow works
   - [ ] Checkout flow works (with Stripe key)
   - [ ] Dashboard accessible
   - [ ] Portfolio page loads

3. **Performance**
   - [ ] Page load times acceptable
   - [ ] Images optimized
   - [ ] No console errors

4. **Mobile**
   - [ ] Mobile responsive
   - [ ] PWA installable (after icons added)
   - [ ] Touch interactions work

## 📝 Notes

- Cloudflare Pages automatically handles:
  - SSL certificates
  - CDN distribution
  - Edge caching
  - Automatic deployments on git push

- Next.js App Router is fully supported on Cloudflare Pages
- API routes work out of the box
- Static pages are pre-rendered and cached

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Cloudflare dashboard

### API Routes Not Working
- Ensure routes are in `/app/api/` directory
- Check Cloudflare Pages logs
- Verify environment variables are set

### Domain Not Resolving
- Check DNS records in Cloudflare
- Verify domain is added in Pages dashboard
- Wait for DNS propagation (up to 24 hours)

