# Session Data Storage Documentation

## Current Storage (Phase 1 - LocalStorage)

Currently, user session data and information is stored in **browser localStorage**. This is a client-side storage solution that persists data across browser sessions.

### Storage Locations

#### 1. **Credits Management** (`lib/utils/credits-manager.ts`)
- **Location**: `localStorage`
- **Keys**:
  - `credits`: Current credit balance (string, e.g., "5")
  - `subscription`: Subscription status ("active" | null)
  - `userTier`: User tier/plan ("viral-starter" | "ceo-access" | "empire" | null)
  - `firstLogin_${userId}`: First-time login flag ("true" | null)
  - `totalGenerations`: Total prompts generated (for unlimited users)

#### 2. **Authentication** (Supabase)
- **Location**: Supabase Auth (server-side)
- **Storage**: 
  - User session tokens stored in Supabase
  - Session data managed by Supabase client
  - Accessible via `useAuth()` hook from `lib/contexts/AuthContext.tsx`

#### 3. **Generation Data** (Session Storage)
- **Location**: `sessionStorage` (temporary, cleared on tab close)
- **Keys**:
  - `generationData`: Current generation session data (JSON string)
  - `pendingPayment`: Payment data for post-payment account creation

#### 4. **Prompt History** (LocalStorage)
- **Location**: `localStorage`
- **Key**: `promptHistory`
- **Format**: JSON array of prompt objects
- **Limit**: Last 50 prompts

### Data Flow

```
User Login
  ↓
Supabase Auth (server-side)
  ↓
AuthContext provides user/session
  ↓
initializeUserCredits() checks localStorage
  ↓
If first login: Set 5 credits in localStorage
If returning: Load credits from localStorage
  ↓
Credits displayed in Header component
```

## Phase 2: Supabase Database Storage

### Planned Database Schema (`lib/db/schema.sql`)

#### Tables:

1. **`users`** (extends Supabase auth.users)
   - `id`: UUID (from auth.users)
   - `email`: TEXT
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

2. **`credits`**
   - `id`: UUID
   - `user_id`: UUID (foreign key to users)
   - `amount`: INTEGER (positive for grants, negative for deductions)
   - `source`: TEXT ('purchase', 'subscription', 'bonus', 'usage')
   - `expires_at`: TIMESTAMP (optional)
   - `created_at`: TIMESTAMP

3. **`subscriptions`**
   - `id`: UUID
   - `user_id`: UUID (foreign key to users)
   - `stripe_subscription_id`: TEXT
   - `status`: TEXT ('active', 'canceled', 'past_due')
   - `plan_id`: TEXT ('ceo-access')
   - `current_period_start`: TIMESTAMP
   - `current_period_end`: TIMESTAMP
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

4. **`prompts`**
   - `id`: UUID
   - `user_id`: UUID (foreign key to users)
   - `prompt_text`: TEXT
   - `hooks`: TEXT[] (array of viral hooks)
   - `audio_suggestion`: TEXT
   - `aesthetic_id`: TEXT
   - `shot_type_id`: TEXT
   - `wardrobe_id`: TEXT
   - `is_public`: BOOLEAN (for SEO pages)
   - `slug`: TEXT (for SEO-friendly URLs)
   - `created_at`: TIMESTAMP

5. **`prompt_history`**
   - `user_id`: UUID (foreign key to users)
   - `prompt_id`: UUID (foreign key to prompts)
   - `created_at`: TIMESTAMP

### Migration Plan (Phase 2)

When moving to Supabase:

1. **Credits Migration**:
   - Read from `localStorage` on first Supabase connection
   - Insert into `credits` table
   - Update `initializeUserCredits()` to query Supabase
   - Keep localStorage as cache/fallback

2. **Subscription Migration**:
   - Verify subscriptions against Stripe webhooks
   - Store in `subscriptions` table
   - Update `verifySubscriptionStatus()` to query Supabase

3. **Prompt History Migration**:
   - Export from localStorage
   - Import into `prompts` and `prompt_history` tables
   - Update portfolio page to query Supabase

## Security Considerations

### Current (LocalStorage)
- ⚠️ **Client-side only**: Can be manipulated by users
- ⚠️ **No server verification**: Credits can be modified in browser
- ✅ **Fast**: No network requests
- ✅ **Works offline**: Persists across sessions

### Phase 2 (Supabase)
- ✅ **Server-side verification**: Credits stored in database
- ✅ **Row Level Security (RLS)**: Users can only access their own data
- ✅ **Audit trail**: All credit changes tracked in database
- ✅ **Stripe webhook verification**: Subscriptions verified server-side
- ⚠️ **Requires network**: Slower, but more secure

## Current Default Credits

**New users receive: 5 free credits**

This is designed to:
- Allow users to try the service (1-2 prompts)
- Encourage conversion after first prompt
- Create urgency to purchase credits

## Accessing Session Data

### In Components:

```typescript
// Authentication
import { useAuth } from "@/lib/contexts/AuthContext";
const { user, session, loading } = useAuth();

// Credits
import { initializeUserCredits } from "@/lib/utils/credits-manager";
const userCredits = initializeUserCredits(user?.id || null);

// Prompt History
const history = JSON.parse(localStorage.getItem("promptHistory") || "[]");

// Generation Data
const data = sessionStorage.getItem("generationData");
```

### In API Routes:

```typescript
// Server-side Supabase client
import { createClient } from "@/lib/supabase/server";
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

## Summary

- **Current**: localStorage + sessionStorage + Supabase Auth
- **Phase 2**: Supabase Database (credits, subscriptions, prompts)
- **Default Credits**: 5 (changed from 50 to encourage conversion)
- **Security**: Client-side storage (Phase 1) → Server-side with RLS (Phase 2)

