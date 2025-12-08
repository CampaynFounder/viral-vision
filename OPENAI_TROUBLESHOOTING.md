# OpenAI API Troubleshooting Guide

## Issue: No Calls to OpenAI API

If you're not seeing any calls to OpenAI, here's how to diagnose and fix it.

## 🔍 Diagnosis Steps

### Step 1: Check Environment Variable

**In Cloudflare Pages:**
1. Go to **Cloudflare Pages** → Your Project
2. **Settings** → **Environment Variables**
3. Check if `OPENAI_API_KEY` is set
4. Make sure it's set for **Production** environment

**The key should:**
- Start with `sk-`
- Be your actual OpenAI API key (not a placeholder)
- Be set without quotes

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Generate a prompt
4. Look for these messages:
   - `✅ OpenAI API key found, making API call...` = Key is set, API will be called
   - `⚠️ OPENAI_API_KEY not configured` = Key is missing, using fallback

### Step 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by `/api/generate-prompt`
4. Generate a prompt
5. Click on the request
6. Check:
   - **Status**: Should be `200 OK`
   - **Response**: Should contain `prompt`, `hooks`, `audio` from OpenAI
   - If you see mock data, the API key is missing

### Step 4: Check Server Logs

**In Cloudflare Pages:**
1. Go to **Cloudflare Pages** → Your Project
2. **Deployments** → Latest deployment
3. Click **View Logs**
4. Look for:
   - `✅ OpenAI API key found, making API call...`
   - `📞 Calling OpenAI API...`
   - `📊 OpenAI API response status: 200`
   - `✅ OpenAI API call successful`
   - Or error messages if something failed

## ✅ Fix: Set OpenAI API Key

### Option 1: Cloudflare Pages Dashboard

1. Go to **Cloudflare Pages** → Your Project
2. **Settings** → **Environment Variables**
3. Click **Add variable**
4. **Variable name**: `OPENAI_API_KEY`
5. **Value**: Your OpenAI API key (starts with `sk-`)
6. **Environment**: Select **Production** (and Preview if needed)
7. **Save**
8. **Redeploy** your site

### Option 2: Get Your OpenAI API Key

1. Go to **https://platform.openai.com/api-keys**
2. Click **"Create new secret key"**
3. Name it (e.g., "Viral Vision Production")
4. **Copy the key** (you can only see it once!)
5. Paste it into Cloudflare Pages environment variables

## 🧪 Test After Fixing

1. **Redeploy** your site in Cloudflare Pages
2. Go to your site
3. Generate a prompt
4. Check browser console for: `✅ OpenAI API key found, making API call...`
5. Check Network tab for `/api/generate-prompt` request
6. Verify the response contains OpenAI-generated content (not mock data)

## 📋 Expected Behavior

### ✅ When OpenAI is Working:
- Browser console shows: `✅ OpenAI API key found, making API call...`
- Network request to `/api/generate-prompt` returns OpenAI-generated prompt
- Response includes detailed, optimized prompt with hooks and audio
- Server logs show successful API call

### ❌ When OpenAI is NOT Working:
- Browser console shows: `⚠️ OPENAI_API_KEY not configured`
- Network request returns mock/fallback data
- Response is basic (just user input + faceless mode)
- Server logs show no OpenAI API calls

## 🔧 Common Issues

### Issue 1: Key Not Set
**Symptom**: Mock responses, no OpenAI calls
**Fix**: Set `OPENAI_API_KEY` in Cloudflare Pages

### Issue 2: Wrong Key Format
**Symptom**: API errors, 401 Unauthorized
**Fix**: Make sure key starts with `sk-` and is complete

### Issue 3: Key Set But Not Redeployed
**Symptom**: Still getting mock responses
**Fix**: Redeploy your site after setting the environment variable

### Issue 4: Key Set in Wrong Environment
**Symptom**: Works in preview but not production (or vice versa)
**Fix**: Set the key for the correct environment (Production)

## 📊 Verify It's Working

After setting the key and redeploying:

1. **Generate a prompt** on your site
2. **Check the result** - it should be:
   - Detailed and optimized (not just your input)
   - Include specific technical details
   - Have 3 viral hooks
   - Have an audio suggestion
3. **Check browser console** - should see OpenAI API logs
4. **Check Network tab** - should see successful API call

## 🚨 Still Not Working?

1. **Double-check** the environment variable is set correctly
2. **Redeploy** your site (environment variables require redeploy)
3. **Check** Cloudflare Pages logs for errors
4. **Verify** your OpenAI API key is valid (test it at https://platform.openai.com)
5. **Check** your OpenAI account has credits/billing set up

---

**The code is ready - you just need to set the `OPENAI_API_KEY` environment variable in Cloudflare Pages!**

