# Vercel Environment Variables Setup

To fix the 500 error on the magic link endpoint, you need to add these environment variables to your Vercel project.

## Required Environment Variables

### 1. Supabase Configuration

Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API

**Add to Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL` = Your Project URL (e.g., `https://tmhetngbdqklqddueugo.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` = Your `service_role` key (click "Reveal" to see it)

### 2. Magic Link Secret

Generate a secure random string (at least 32 characters) for JWT signing.

**Add to Vercel:**
- `MAGIC_LINK_SECRET` = `l8wUls0Y81zuWgZNUMu3hadj5xlg5uHzdU5tRrTx5dQ=` (or generate a new one with: `openssl rand -base64 32`)

### 3. App URL (Optional but Recommended)

**Add to Vercel:**
- `NEXT_PUBLIC_APP_URL` = `https://www.earnyour.com` (or your production domain)

### 4. Email Service (Optional - for sending magic links via email)

If you want to send actual emails instead of just logging the link:

**Add to Vercel:**
- `RESEND_API_KEY` = Your Resend API key from [resend.com](https://resend.com)
- `RESEND_FROM_EMAIL` = `EarnYour <onboarding@resend.dev>` (or your verified domain)

## How to Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `earnyour-marketing` project
3. Click **Settings** → **Environment Variables**
4. Add each variable above
5. **Important:** After adding variables, you MUST redeploy:
   - Go to **Deployments** tab
   - Click the three dots (`...`) on the latest deployment
   - Select **Redeploy**

## Quick Copy-Paste Checklist

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ MAGIC_LINK_SECRET
✅ NEXT_PUBLIC_APP_URL (optional)
✅ RESEND_API_KEY (optional)
✅ RESEND_FROM_EMAIL (optional)
```

## Testing

After redeploying, try the login again. The 500 error should be resolved.

If you still get errors, check the Vercel Function Logs:
1. Go to your deployment
2. Click on the **Functions** tab
3. Click on `/api/auth/magic-link`
4. Check the logs for specific error messages

