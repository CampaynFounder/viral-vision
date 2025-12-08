# System Prompt Storage & Version Tracking

## Overview

System prompts are now stored in the Supabase database, allowing for version control, A/B testing, and tracking which prompt version was used for each generation.

## Database Schema

### `system_prompts` Table

```sql
CREATE TABLE public.system_prompts (
  id UUID PRIMARY KEY,
  version TEXT UNIQUE,              -- e.g., "v1.0", "black-luxury-v2"
  prompt_text TEXT NOT NULL,         -- The actual system prompt
  description TEXT,                  -- Description of changes
  is_active BOOLEAN DEFAULT false,   -- Only one active at a time
  created_by UUID,                   -- Admin who created it
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### `prompts` Table Update

Added `system_prompt_id` field to track which system prompt version was used:

```sql
ALTER TABLE public.prompts 
ADD COLUMN system_prompt_id UUID REFERENCES public.system_prompts(id);
```

## API Endpoints

### GET `/api/system-prompt`

Retrieves the active system prompt from the database.

**Response:**
```json
{
  "id": "uuid",
  "version": "v1.0",
  "prompt": "Full system prompt text...",
  "description": "Initial Black Luxury prompt",
  "source": "database" | "fallback"
}
```

**Fallback Behavior:**
- If no active prompt exists in DB, returns hardcoded fallback
- If Supabase not configured, returns fallback
- Logs which source was used

### POST `/api/system-prompt`

Creates or updates a system prompt in the database.

**Request Body:**
```json
{
  "version": "v1.1",
  "prompt_text": "Full system prompt text...",
  "description": "Updated with new negative prompt logic",
  "is_active": true
}
```

**Behavior:**
- If `is_active: true`, automatically deactivates all other prompts
- Uses upsert (creates if version doesn't exist, updates if it does)
- Requires service role key (admin operation)

## Usage in Generate Prompt Route

The `/api/generate-prompt` route now:

1. **Fetches system prompt from DB** on each request
2. **Falls back to hardcoded prompt** if DB fetch fails
3. **Interpolates user data** into the prompt template
4. **Tracks system_prompt_id** for analytics (Phase 2)
5. **Returns systemPromptId** in response for tracking

## Setting Up Your First System Prompt

### Step 1: Run Database Migration

Execute the updated `lib/db/schema.sql` in your Supabase SQL Editor to create the `system_prompts` table.

### Step 2: Create Initial System Prompt

Use the POST endpoint to create your first active system prompt:

```bash
curl -X POST https://your-domain.com/api/system-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "version": "v1.0",
    "prompt_text": "# Role & Objective\n\nYou are an Elite AI Visual Director...",
    "description": "Initial Black Luxury system prompt",
    "is_active": true
  }'
```

Or use the current hardcoded prompt from `app/api/system-prompt/route.ts` as a starting point.

### Step 3: Verify It's Working

1. Generate a prompt on your site
2. Check server logs for: `📝 Using system prompt version: v1.0 (database)`
3. Verify the prompt is being used correctly

## Version Control Workflow

### Creating a New Version

1. **Create new version** (initially inactive):
```json
{
  "version": "v1.1",
  "prompt_text": "Updated prompt...",
  "description": "Added new instructions for X",
  "is_active": false
}
```

2. **Test the new version** (manually by ID in code, or create test endpoint)

3. **Activate the new version**:
```json
{
  "version": "v1.1",
  "is_active": true
}
```

This automatically deactivates the old version.

### A/B Testing

You can:
- Store multiple versions in the database
- Manually switch between them
- Track which version performs better via `system_prompt_id` in prompts table

## Tracking & Analytics

### Current Implementation

- System prompt ID is logged in console
- System prompt ID is returned in API response
- Ready for Phase 2 database storage

### Phase 2 Integration

When fully integrated with Supabase:

1. **Store system_prompt_id** with each generated prompt:
```typescript
await supabase.from('prompts').insert({
  user_id: userId,
  prompt_text: generatedPrompt,
  system_prompt_id: systemPromptId,
  // ... other fields
});
```

2. **Query analytics**:
```sql
SELECT 
  sp.version,
  COUNT(p.id) as usage_count,
  AVG(p.quality_score) as avg_quality
FROM system_prompts sp
LEFT JOIN prompts p ON p.system_prompt_id = sp.id
GROUP BY sp.version;
```

## Environment Variables

Required for system prompt storage:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For admin operations
```

## Security

- **RLS Policies**: All authenticated users can read active system prompt
- **Admin Operations**: POST endpoint requires service role key
- **Fallback**: Always falls back to hardcoded prompt if DB unavailable

## Benefits

1. **Version Control**: Track changes to system prompts over time
2. **A/B Testing**: Test different prompt versions
3. **Analytics**: Track which prompt versions perform best
4. **Easy Updates**: Update prompts without code deployment
5. **Rollback**: Easy to revert to previous versions
6. **Audit Trail**: See who created which version and when

## Next Steps

1. ✅ Database schema created
2. ✅ API endpoints implemented
3. ✅ Generate route updated
4. ⏳ Create initial system prompt in database
5. ⏳ Phase 2: Store system_prompt_id with each generation
6. ⏳ Build admin UI for managing system prompts

