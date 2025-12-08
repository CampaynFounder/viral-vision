# How to Check if OpenAI API is Being Called

## ⚠️ Important: OpenAI Calls Are Server-Side

**You won't see OpenAI API calls in browser network logs** because:
- The browser calls your server at `/api/generate-prompt`
- Your server then calls OpenAI's API
- Only the server-to-OpenAI call happens, which you can't see in browser DevTools

## ✅ How to Verify OpenAI is Being Called

### Method 1: Check Browser Console (Easiest)

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Generate a prompt
4. Look for these messages:

**✅ OpenAI IS being called:**
```
✅ OpenAI API was called successfully
📊 OpenAI Model: gpt-4o
🕐 Timestamp: 2024-01-15T10:30:00.000Z
```

**❌ OpenAI is NOT being called:**
```
⚠️ OpenAI API was NOT called
📋 Reason: OPENAI_API_KEY not configured
🔄 Using fallback response
```

### Method 2: Check Network Tab Response

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by `/api/generate-prompt`
4. Generate a prompt
5. Click on the request
6. Go to **Response** tab
7. Look for `_debug` object:

**✅ OpenAI IS being called:**
```json
{
  "prompt": "...",
  "hooks": [...],
  "_debug": {
    "openaiCalled": true,
    "model": "gpt-4o",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**❌ OpenAI is NOT being called:**
```json
{
  "prompt": "...",
  "hooks": [...],
  "_debug": {
    "openaiCalled": false,
    "reason": "OPENAI_API_KEY not configured",
    "usingFallback": true
  }
}
```

### Method 3: Check Server Logs (Cloudflare Pages)

1. Go to **Cloudflare Pages** → Your Project
2. **Deployments** → Latest deployment
3. Click **View Logs**
4. Look for these messages:

**✅ OpenAI IS being called:**
```
✅ OpenAI API key found, making API call...
📞 Calling OpenAI API...
🌐 OpenAI API URL: https://api.openai.com/v1/chat/completions
🔑 API Key present: Yes (sk-xxx...)
📊 OpenAI API response status: 200
⏱️ OpenAI API call duration: 1234ms
✅ OpenAI API call successful
```

**❌ OpenAI is NOT being called:**
```
⚠️ OPENAI_API_KEY not configured - using fallback mock response
```

### Method 4: Check Response Quality

**✅ OpenAI IS working:**
- Prompt is detailed and optimized (not just your input)
- Includes technical details (camera specs, lighting, etc.)
- Has 3 viral hooks
- Has audio suggestion
- Negative prompts are comprehensive

**❌ OpenAI is NOT working:**
- Prompt is just your input text
- Generic hooks: "POV: You finally stopped trading time for money..."
- Generic audio: "Just a Girl - No Doubt"
- No detailed technical specifications

## 🔧 If OpenAI is NOT Being Called

### Step 1: Check Environment Variable

1. Go to **Cloudflare Pages** → Your Project
2. **Settings** → **Environment Variables**
3. Check if `OPENAI_API_KEY` exists
4. Make sure it:
   - Starts with `sk-`
   - Is set for **Production** environment
   - Has no quotes around it

### Step 2: Redeploy

After setting the environment variable:
1. **Redeploy** your site (environment variables require redeploy)
2. Wait for deployment to complete
3. Try generating a prompt again

### Step 3: Verify API Key

1. Go to https://platform.openai.com/api-keys
2. Make sure your key is active
3. Check your OpenAI account has credits/billing set up

## 📊 Quick Test

Run this in browser console after generating a prompt:

```javascript
// Check the last API response
fetch('/api/generate-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userInput: 'test prompt',
    model: 'midjourney'
  })
})
.then(r => r.json())
.then(data => {
  console.log('OpenAI Called:', data._debug?.openaiCalled);
  console.log('Debug Info:', data._debug);
});
```

## 🎯 Summary

- **Browser Network Tab**: Shows `/api/generate-prompt` call (not OpenAI directly)
- **Browser Console**: Shows `_debug` info about OpenAI call status
- **Server Logs**: Show detailed OpenAI API call information
- **Response Quality**: OpenAI responses are detailed and optimized

The easiest way is to check the **browser console** for the debug messages!
