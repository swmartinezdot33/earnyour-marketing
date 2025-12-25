# Testing Login Guide

## Quick Start for Testing

### 1. Required Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://tmhetngbdqklqddueugo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaGV0bmdiZHFrbHFkZHVldWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzU0MDksImV4cCI6MjA4MjAxMTQwOX0.WkBhRzgHJrotVPjhzv3wqyo47PqZWHYrPQYQwwHGlLY
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Get Service Role Key from:
# https://supabase.com/dashboard/project/tmhetngbdqklqddueugo/settings/api

# Authentication (Required)
MAGIC_LINK_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Service (Required for magic links)
RESEND_API_KEY=your_resend_api_key_here

# Stripe (Optional - only needed for course purchases)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GoHighLevel (Optional - only needed for CRM integration)
GHL_API_TOKEN=your_ghl_pit_token_here
GHL_LOCATION_ID=your_location_id_here
```

### 2. Get Your Resend API Key (for Email)

1. Sign up at https://resend.com (free tier available)
2. Go to API Keys: https://resend.com/api-keys
3. Create a new API key
4. Copy it to your `.env.local` as `RESEND_API_KEY`

**Note:** Resend free tier allows 100 emails/day, perfect for testing.

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Login Steps

1. **Visit the login page:**
   ```
   http://localhost:3000/login
   ```

2. **Enter the admin email:**
   ```
   admin@earnyour.com
   ```

3. **Check your email:**
   - You'll receive an email from "EarnYour <onboarding@resend.dev>"
   - Click the "Log In" button in the email
   - This will redirect you to the dashboard

4. **Admin Dashboard:**
   - After login, you'll be redirected to `/admin/courses`
   - You can create courses, modules, and lessons here

### 5. Testing Without Email (Development Mode) ✅

**The app now automatically shows the magic link in development mode!**

When you're running `npm run dev`:
1. Enter your email and click "Send Magic Link"
2. The magic link will appear **on the page** with a button to click
3. It will also be logged in the **server console** for easy copying
4. You can click the "Open Login Link" button directly on the page

**No email setup required for local testing!**

The magic link will be displayed like this:
```
Check your email for a login link

Click here to login: http://localhost:3000/api/auth/verify?token=...
[Open Login Link] ← Click this button!
```

### 6. Admin User Details

- **Email:** `admin@earnyour.com`
- **Role:** `admin`
- **Access:** Full admin dashboard at `/admin/courses`

### 7. Creating Test Users

Any email you enter will automatically create a user account. To make a user an admin:

1. Go to Supabase Dashboard
2. Navigate to Table Editor → `users` table
3. Find the user by email
4. Update the `role` field to `admin`

Or use SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

### 8. Troubleshooting

**"Failed to send magic link"**
- Check that `RESEND_API_KEY` is set correctly
- Verify Resend account is active
- Check server console for error details

**"Invalid token" or "Expired token"**
- Magic links expire after 24 hours
- Request a new login link

**"Unauthorized" errors**
- Make sure you're logged in
- Check that your session cookie is set
- Try logging out and logging back in

**Database connection errors**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase project is active
- Ensure network connectivity

### 9. Testing Different User Roles

**Admin User:**
- Email: `admin@earnyour.com`
- Can access: `/admin/courses`, `/dashboard`
- Can create/edit courses

**Student User:**
- Any email (e.g., `student@test.com`)
- Can access: `/dashboard`, `/courses`
- Can enroll in and view courses

### 10. Quick Test Checklist

- [ ] `.env.local` file created with all required variables
- [ ] Resend API key configured
- [ ] Supabase service role key configured
- [ ] `npm run dev` running
- [ ] Visit `http://localhost:3000/login`
- [ ] Enter `admin@earnyour.com`
- [ ] Check email for magic link
- [ ] Click link and verify redirect to `/admin/courses`

## Need Help?

If you're having issues:
1. Check the server console for errors
2. Verify all environment variables are set
3. Make sure Supabase project is active
4. Check Resend dashboard for email delivery status

