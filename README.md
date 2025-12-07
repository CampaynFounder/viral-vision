# Viral Vision MVP

A mobile-first Next.js application for generating viral faceless content prompts with luxury "Digital Penthouse" aesthetics.

## Overview

Viral Vision helps content creators generate high-converting faceless content prompts for Instagram/Reels with luxury aesthetics. The app targets the "WealthBae/Digital CEO" demographic with a premium, frictionless user experience.

## Features (Phase 1 - MVP)

### Core Functionality
- ✅ **Prompt Generation Flow**: Three-screen wizard (Input → Refinement → Output)
- ✅ **Faceless Mode Toggle**: Automatically injects negative prompts for faces
- ✅ **Aesthetic Selectors**: Old Money, Clean Girl, Dark Feminine, Y2K
- ✅ **Shot Type Selection**: POV, Candid, Detail, Wide
- ✅ **Wardrobe Selection**: Athleisure, Business Chic, Evening Gown, Streetwear
- ✅ **Viral Hook Generation**: AI-generated caption hooks (mock in Phase 1)
- ✅ **Audio Suggestions**: Trending audio recommendations (mock in Phase 1)

### User Flows
- ✅ **Landing Page**: Hero section with value proposition and CTA
- ✅ **Checkout Flow**: Bottom sheet modal with pricing tiers
- ✅ **Credit System**: Mock credit tracking with localStorage
- ✅ **Top-Up Modal**: "Velvet Rope" notification when credits hit 0
- ✅ **Portfolio/History**: Grid view of past prompts with export functionality
- ✅ **CEO Dashboard**: Subscription user dashboard with Trend Watch ticker

### Design System
- ✅ **Luxury Aesthetics**: Champagne/Mocha color palette
- ✅ **Typography**: Cinzel for headings, Montserrat for body
- ✅ **Micro-Interactions**: Liquid gold inputs, receipt printing animations
- ✅ **Haptic Feedback**: Placeholders for mobile vibration
- ✅ **Mobile-First**: Optimized for iOS Safari with custom scroll

### Phase 2 Placeholders
- ✅ **Backend API Routes**: OpenAI, Stripe, Supabase integration placeholders
- ✅ **Analytics**: GA4 tracking structure ready
- ✅ **SEO**: Programmatic SEO route structure (`/recipe/[slug]`)
- ✅ **Database Schema**: Complete Supabase schema with RLS policies

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4+
- **Animations**: Framer Motion
- **State Management**: Zustand
- **PWA**: Service Worker + Manifest

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy environment variables template:
```bash
cp .env.example .env.local
```

4. (Phase 2) Fill in your API keys in `.env.local`:
   - OpenAI API key
   - Supabase credentials
   - Stripe keys
   - GA4 Measurement ID

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/app
  /(routes)
    /page.tsx                    # Landing page
    /generate/page.tsx           # Main generator (Screen 1)
    /generate/refine/page.tsx    # Refinement wizard (Screen 2)
    /generate/result/page.tsx    # Output display (Screen 3)
    /checkout/page.tsx           # Payment flow
    /dashboard/page.tsx          # CEO Access dashboard
    /portfolio/page.tsx          # Prompt history
    /recipe/[slug]/page.tsx      # SEO pages (Phase 2)
  /api
    /generate-prompt/route.ts    # OpenAI integration (Phase 2)
    /checkout/route.ts           # Stripe session (Phase 2)
    /webhooks/stripe/route.ts    # Payment webhooks (Phase 2)
/components
  /ui                            # Reusable UI components
  /layout                        # Layout components
/lib
  /utils                         # Utility functions
  /constants                     # Configuration constants
  /db                            # Database schema (Phase 2)
/public                          # Static assets
```

## Pricing Tiers

1. **Viral Starter** - $27 one-time
   - 50 faceless prompt credits
   - Access to "The Vault"
   - Commercial rights

2. **CEO Access** - $47/month
   - Unlimited generation
   - Trend Watch weekly updates
   - Commercial license for reselling

3. **Empire Bundle** - $97 one-time
   - 100 credits
   - Prompt Pack Reseller Kit
   - Commercial license

## Phase 2 Implementation Checklist

### Backend Integration
- [ ] Set up Supabase project and run schema.sql
- [ ] Implement OpenAI API integration in `/api/generate-prompt`
- [ ] Set up Stripe products and implement checkout flow
- [ ] Configure Stripe webhooks for payment confirmation
- [ ] Replace localStorage with Supabase for credits/history

### Analytics
- [ ] Add GA4 Measurement ID to environment variables
- [ ] Verify event tracking is working
- [ ] Set up conversion tracking for purchases
- [ ] Configure funnel tracking

### SEO
- [ ] Implement public prompt indexing
- [ ] Generate slugs for prompts
- [ ] Set up static generation for `/recipe/[slug]` pages
- [ ] Add schema markup (CreativeWork/HowTo)

### Deployment
- [ ] Set up Cloudflare deployment
- [ ] Configure domain and SSL
- [ ] Set up environment variables in production
- [ ] Test PWA installation on mobile devices

## Development Notes

- All backend calls in Phase 1 use mock data
- Credit system uses localStorage (will migrate to Supabase in Phase 2)
- Payment flow shows success states without actual processing
- Analytics tracking structure is ready but requires GA4 ID

## Design Principles

- **Frictionless Luxury**: Every interaction feels expensive
- **Mobile-First**: 90% of traffic is mobile, optimized for iOS Safari
- **Story-like Navigation**: Tap-based flow, minimal scrolling
- **Micro-Interactions**: Liquid gold transitions, receipt printing, haptic feedback

## License

ISC

