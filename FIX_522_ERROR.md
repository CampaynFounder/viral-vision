# Fixing 522 Error on vvsprompts.com

## What is a 522 Error?
**522 = Connection Timed Out**

This means Cloudflare can't reach your origin server (Cloudflare Pages). This usually means:
- Domain not connected to Pages project
- Pages project not deployed
- Build failed
- DNS misconfiguration

## Quick Fix Steps

### Step 1: Verify Cloudflare Pages Project Exists
1. Go to **Cloudflare Dashboard** → **Pages**
2. Check if you have a project called `viral-vision` (or similar)
3. If no project exists, you need to create one first

### Step 2: Check Deployment Status
1. In Cloudflare Pages → Your Project
2. Go to **Deployments** tab
3. Check:
   - Is there a recent deployment?
   - What's the status? (Success, Failed, Building)
   - If failed, check build logs

### Step 3: Verify Domain Connection
1. In Cloudflare Pages → Your Project
2. Go to **Custom Domains** tab
3. Check:
   - Is `vvsprompts.com` listed?
   - What's the status? (Active, Pending, Error)
   - If not listed, you need to add it

### Step 4: Check DNS Records
1. Go to **Cloudflare Dashboard** → **DNS** → **Records**
2. Look for records for `vvsprompts.com`:
   - Should have a **CNAME** record pointing to Pages
   - Or **A/AAAA** records if using IPs
3. If missing, add the record (Cloudflare Pages will show you what to add)

## Common Scenarios & Fixes

### Scenario 1: No Pages Project Created
**Symptom**: No project in Cloudflare Pages dashboard

**Fix**:
1. Cloudflare Dashboard → **Pages** → **Create a project**
2. Connect to GitHub repository: `CampaynFounder/viral-vision`
3. Configure:
   - Framework: **Next.js**
   - Build command: `npm run build`
   - Build output: `.next`
4. Deploy the project
5. Then add custom domain

### Scenario 2: Domain Not Connected
**Symptom**: Project exists but `vvsprompts.com` not in Custom Domains

**Fix**:
1. Cloudflare Pages → Your Project
2. **Custom Domains** tab → **Set up a custom domain**
3. Enter: `vvsprompts.com`
4. Follow the DNS setup instructions
5. Wait 10-15 minutes for DNS propagation

### Scenario 3: Build Failed
**Symptom**: Deployment shows "Failed" status

**Fix**:
1. Check **Deployments** → Click on failed deployment
2. View **Build logs** to see error
3. Common issues:
   - Missing environment variables
   - Build errors in code
   - Node.js version mismatch
4. Fix the issue and redeploy

### Scenario 4: DNS Not Configured
**Symptom**: Domain not resolving or pointing to wrong place

**Fix**:
1. Cloudflare Dashboard → **DNS** → **Records**
2. Add CNAME record:
   - **Type**: CNAME
   - **Name**: `@` (or `vvsprompts.com`)
   - **Target**: `[your-pages-project].pages.dev`
   - **Proxy**: Proxied (orange cloud)
3. Save and wait for propagation

## Step-by-Step: Complete Setup

### If You Haven't Created Pages Project Yet:

1. **Create Pages Project**
   ```
   Cloudflare Dashboard → Pages → Create a project
   → Connect to GitHub → Select: CampaynFounder/viral-vision
   → Branch: main
   → Framework: Next.js
   → Build command: npm run build
   → Build output: .next
   ```

2. **Wait for First Deployment**
   - Cloudflare will build your project
   - Check Deployments tab for status
   - Should show "Success" when done

3. **Add Custom Domain**
   ```
   Pages → Your Project → Custom Domains
   → Set up a custom domain
   → Enter: vvsprompts.com
   → Follow DNS instructions
   ```

4. **Update DNS (if needed)**
   - Cloudflare will show you what DNS records to add
   - Usually a CNAME pointing to `[project].pages.dev`
   - Add in Cloudflare DNS dashboard

5. **Wait for Propagation**
   - DNS: 10-60 minutes
   - SSL: 5-10 minutes after DNS is active

## Verify It's Working

After setup, wait 15 minutes, then:

```bash
# Check DNS
nslookup vvsprompts.com

# Check if site loads
curl -I https://vvsprompts.com
```

Should return `200 OK` instead of `522`.

## Still Getting 522?

### Check These:

1. **Is the project deployed?**
   - Pages → Deployments → Is there a successful deployment?

2. **Is the domain connected?**
   - Pages → Custom Domains → Is `vvsprompts.com` listed?

3. **Are DNS records correct?**
   - DNS → Records → Does CNAME point to Pages project?

4. **Is SSL provisioning?**
   - Custom Domains → Check SSL status
   - May show "Pending" initially

5. **Check Cloudflare Status**
   - Visit https://www.cloudflarestatus.com
   - See if there are any outages

## Quick Diagnostic Commands

```bash
# Check DNS resolution
nslookup vvsprompts.com
dig vvsprompts.com

# Check if Pages project is accessible
curl -I https://[your-project].pages.dev

# Check main domain
curl -I https://vvsprompts.com
```

## Most Likely Issue

Based on the 522 error, the most common cause is:
**Domain not properly connected to Cloudflare Pages project**

**Quick Check:**
1. Go to Cloudflare Pages dashboard
2. Do you see a project?
3. Is `vvsprompts.com` in the Custom Domains list?

If no to either, that's your issue!

