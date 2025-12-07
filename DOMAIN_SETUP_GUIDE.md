# Domain Setup Guide: vvsprompts.com

## Current Issue
Domain is not resolving - DNS records are not configured.

## Step-by-Step Fix

### Step 1: Verify Domain is Registered
1. Check your domain registrar (where you bought vvsprompts.com)
2. Verify domain is active and paid
3. Check expiration date

### Step 2: Connect Domain to Cloudflare

#### Option A: Domain Already in Cloudflare
If your domain is already in Cloudflare:

1. **Go to Cloudflare Dashboard**
2. **Select your domain** (`vvsprompts.com`)
3. **Go to DNS → Records**
4. **Check if there's a CNAME or A record for Pages**

#### Option B: Add Domain to Cloudflare
If domain is NOT in Cloudflare:

1. **Cloudflare Dashboard → Add Site**
2. **Enter**: `vvsprompts.com`
3. **Choose plan** (Free is fine)
4. **Cloudflare will scan your DNS records**
5. **Update nameservers** at your registrar to Cloudflare's nameservers

### Step 3: Connect Domain to Cloudflare Pages

1. **Cloudflare Dashboard → Pages**
2. **Select your project** (`viral-vision`)
3. **Go to "Custom Domains" tab**
4. **Click "Set up a custom domain"**
5. **Enter**: `vvsprompts.com`
6. **Follow the setup instructions**

Cloudflare will show you:
- DNS records to add (if needed)
- Nameserver changes (if needed)

### Step 4: Configure DNS Records

After connecting to Pages, you'll need one of these:

**Option 1: CNAME Record (Recommended)**
```
Type: CNAME
Name: @ (or vvsprompts.com)
Target: [your-pages-project].pages.dev
Proxy: Proxied (orange cloud)
```

**Option 2: A/AAAA Records**
Cloudflare Pages will provide specific IPs if needed.

### Step 5: Update Nameservers (If Needed)

If Cloudflare shows nameservers to update:

1. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Find DNS/Nameserver settings**
3. **Replace with Cloudflare nameservers**:
   ```
   [name].ns.cloudflare.com
   [name].ns.cloudflare.com
   ```
   (Get exact names from Cloudflare dashboard)

### Step 6: Wait for Propagation

- **DNS Propagation**: 24-48 hours (usually 1-2 hours)
- **SSL Certificate**: 5-10 minutes after DNS is active

## Quick Checklist

- [ ] Domain is registered and active
- [ ] Domain added to Cloudflare (or already there)
- [ ] Nameservers point to Cloudflare (if using Cloudflare DNS)
- [ ] Cloudflare Pages project deployed
- [ ] Custom domain added in Pages dashboard
- [ ] DNS records configured (CNAME or A records)
- [ ] SSL certificate provisioning (automatic)

## Verify Setup

After completing steps, wait 10-15 minutes, then:

```bash
# Check DNS
nslookup vvsprompts.com

# Check if site loads
curl -I https://vvsprompts.com
```

## Common Scenarios

### Scenario 1: Domain in Cloudflare, Not Connected to Pages
**Fix**: Pages → Custom Domains → Add domain

### Scenario 2: Domain Not in Cloudflare
**Fix**: Add site to Cloudflare first, then connect to Pages

### Scenario 3: Nameservers Not Updated
**Fix**: Update nameservers at registrar to Cloudflare's

### Scenario 4: DNS Records Missing
**Fix**: Add CNAME record pointing to Pages project

## Still Not Working?

1. **Check Cloudflare Pages Dashboard**:
   - Is project deployed? (Check Deployments tab)
   - Is custom domain listed? (Check Custom Domains tab)
   - What's the domain status? (Should be "Active")

2. **Check DNS Records**:
   - Cloudflare Dashboard → DNS → Records
   - Is there a record for `vvsprompts.com`?
   - Does it point to Pages?

3. **Check Nameservers**:
   - At your registrar, do nameservers point to Cloudflare?
   - Use: `whois vvsprompts.com` to check

4. **Wait Longer**:
   - DNS can take up to 48 hours
   - Usually works within 1-2 hours

## Need Help?

Share:
1. Where is your domain registered? (GoDaddy, Namecheap, etc.)
2. Is the domain already in Cloudflare?
3. What does Cloudflare Pages → Custom Domains show?
4. What do you see in Cloudflare → DNS → Records?

