# EarnYour Marketing Agency Website

The premium, high-performance marketing agency website for EarnYour Marketing.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Content:** MDX (Blog & Case Studies)
- **Forms:** Server Actions + Zod
- **Database:** Local JSON (Dev) / Supabase (Prod)
- **Email:** Resend

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run local development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
RESEND_API_KEY=re_123...
CONTACT_TO_EMAIL=your@email.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GoHighLevel Integration (Required for course platform)

# AGENCY-LEVEL PIT TOKEN (Required for SaaS - Creating/Managing Subaccounts)
# This token has permissions to create subaccounts and generate subaccount tokens
# Used for: Creating subaccounts, listing subaccounts, generating subaccount PIT tokens
GHL_AGENCY_PIT_TOKEN=pit-cf8f0fb1-7a9c-4ae2-9fd0-56b9ca28519d

# DEFAULT LOCATION PIT TOKEN (Required for regular users)
# This is a PIT token for the default location where all regular users are managed
# Used for: Regular users (courses, memberships, marketing) - NOT whitelabel SaaS customers
GHL_DEFAULT_LOCATION_PIT_TOKEN=your-default-location-pit-token
# Or use GHL_API_TOKEN as fallback
GHL_API_TOKEN=your-ghl-pit-token

# GoHighLevel Default Location ID (For non-whitelabel users)
# This is where ALL regular users are created as contacts (not subaccounts)
GHL_DEFAULT_LOCATION_ID=GQOh2EMzgc3bRAfN7Q9j

# NOTE: SUBACCOUNT-LEVEL PIT TOKENS are automatically generated and stored
# in whitelabel_accounts.ghl_api_token when linking a subaccount.
# These are generated using the agency PIT token and are specific to each subaccount.

# OpenAI API (Required for AI-powered course builder)
# Used for generating course structures, content, and metadata
OPENAI_API_KEY=sk-...
```

## Content Management

### Blog Posts
Add new `.mdx` files to `content/blog/`. Use the frontmatter format:

```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
description: "Short summary."
tags: ["SEO", "Ads"]
author: "Name"
readingTime: "5 min read"
---
```

### Case Studies
Add new `.mdx` files to `content/case-studies/`.

### Locations (North Mississippi)
Edit `data/cities.json` to add or remove cities. The `/locations/[city]` pages will be generated automatically.
Currently targeting: Southaven, Olive Branch, Tupelo, Oxford, etc.
Access the hub at `/locations`.

## Branding

- **Colors:** Edited in `src/app/globals.css` via CSS variables.
- **Fonts:** Configured in `src/app/layout.tsx`. Currently using Google Fonts (Oswald/Inter) as fallbacks. To use local fonts, place files in `public/fonts/` and uncomment the `localFont` code in `layout.tsx`.

## Deployment

Connect this repo to Vercel.
Add the environment variables in Vercel project settings.
The build command is `npm run build`.

## GHL Whitelabel Setup

See [GHL_WHITELABEL_SETUP.md](./GHL_WHITELABEL_SETUP.md) for detailed instructions on how to:
- Get your GHL API token and Location ID
- Create a whitelabel account
- Set up custom fields and pipelines
- Link users to whitelabel accounts
- Test the integration
