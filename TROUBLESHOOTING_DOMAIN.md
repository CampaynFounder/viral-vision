# Troubleshooting: vvsprompts.com Not Loading

## Quick Checks

### 1. Check DNS Configuration
Run this command to see where your domain points:
```bash
nslookup vvsprompts.com
```

**Expected**: Should point to Cloudflare nameservers or Cloudflare Pages IPs

### 2. Check Cloudflare Pages Deployment
1. Go to Cloudflare Dashboard → Pages
2. Check if your project is deployed
3. Look for deployment status (should be "Active")
4. Check deployment logs for errors

### 3. Verify Domain Connection
1. Cloudflare Pages → Your Project → Custom Domains
2. Verify `vvsprompts.com` is listed
3. Check status (should be "Active")
4. If not connected, click "Set up a custom domain"

### 4. Check DNS Records
In Cloudflare Dashboard → DNS:
- Should have a CNAME record pointing to your Pages project
- Or A/AAAA records if using Cloudflare nameservers

## Common Issues & Solutions

### Issue 1: Domain Not Connected to Pages
**Symptoms**: Domain doesn't resolve or shows Cloudflare default page

**Solution**:
1. Cloudflare Pages → Your Project
2. Go to "Custom Domains" tab
3. Click "Set up a custom domain"
4. Enter `vvsprompts.com`
5. Follow the DNS setup instructions

### Issue 2: DNS Not Propagated
**Symptoms**: Domain doesn't resolve at all

**Solution**:
- Wait 24-48 hours for DNS propagation
- Check if nameservers are correct
- Verify DNS records in Cloudflare

### Issue 3: Build Failed
**Symptoms**: Domain loads but shows error page

**Solution**:
1. Check Cloudflare Pages → Deployments
2. Look for failed builds
3. Check build logs
4. Fix any build errors
5. Redeploy

### Issue 4: SSL Certificate Not Ready
**Symptoms**: HTTPS doesn't work, HTTP redirects

**Solution**:
- Cloudflare automatically provisions SSL
- Wait 5-10 minutes after domain connection
- Check SSL/TLS settings in Cloudflare

### Issue 5: Wrong Nameservers
**Symptoms**: Domain doesn't point to Cloudflare

**Solution**:
1. Check your domain registrar
2. Update nameservers to Cloudflare's:
   - `[name].ns.cloudflare.com`
   - (Get exact nameservers from Cloudflare dashboard)

## Step-by-Step Fix

### Step 1: Verify Project is Deployed
```bash
# Check Cloudflare Pages dashboard
# Should see recent deployment
# Status should be "Active"
```

### Step 2: Connect Domain
1. Cloudflare Pages → Your Project
2. Custom Domains → Add domain
3. Enter: `vvsprompts.com`
4. Follow setup instructions

### Step 3: Update DNS (if needed)
If Cloudflare shows DNS records to add:
- Add CNAME record pointing to Pages project
- Or update nameservers at registrar

### Step 4: Wait for Propagation
- DNS: 24-48 hours (usually faster)
- SSL: 5-10 minutes

### Step 5: Test
```bash
# Test HTTP
curl -I http://vvsprompts.com

# Test HTTPS
curl -I https://vvsprompts.com
```

## Quick Diagnostic Commands

```bash
# Check DNS resolution
nslookup vvsprompts.com
dig vvsprompts.com

# Check if site is reachable
curl -I https://vvsprompts.com
curl -I http://vvsprompts.com

# Check SSL certificate
openssl s_client -connect vvsprompts.com:443 -servername vvsprompts.com
```

## Cloudflare Pages Setup Checklist

- [ ] Project created in Cloudflare Pages
- [ ] Connected to GitHub repository
- [ ] Build succeeded (check deployments)
- [ ] Custom domain added (`vvsprompts.com`)
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Domain status shows "Active"

## Still Not Working?

1. **Check Cloudflare Dashboard**:
   - Pages → Your Project → Deployments (any errors?)
   - Pages → Your Project → Custom Domains (domain listed?)
   - DNS → Records (correct records?)

2. **Check Domain Registrar**:
   - Nameservers point to Cloudflare?
   - Domain unlocked?
   - No transfer locks?

3. **Check Build**:
   - Recent deployment successful?
   - No build errors in logs?
   - Environment variables set?

4. **Contact Support**:
   - Cloudflare Support (if DNS/SSL issues)
   - Check Cloudflare Status page

