# Database Setup (Phase 2)

This directory contains the Supabase database schema for Viral Vision.

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Navigate to SQL Editor in your Supabase dashboard
3. Run the SQL from `schema.sql` to create all tables, policies, and indexes
4. Update your `.env.local` file with Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Schema Overview

### Tables

- **users**: Extends Supabase auth.users with additional user data
- **credits**: Tracks user credits from purchases
- **subscriptions**: Manages subscription status and Stripe subscription IDs
- **prompts**: Stores generated prompts with metadata
- **prompt_history**: Links users to their prompt history for portfolio view

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Public prompts are accessible to all authenticated users
- Service role can access all data for backend operations

## Credit System Logic

Credits are deducted when:
- User generates a prompt (1 credit per generation)
- Subscription users have unlimited credits (check `subscriptions.status = 'active'`)

## SEO Pages

Public prompts (`is_public = true`) will be used to generate programmatic SEO pages at `/recipe/[slug]`. The slug is generated from the prompt text.

