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
