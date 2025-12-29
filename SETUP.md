# Production Setup Guide

## Initial Admin User Setup

To create your first admin user and test the course builder in production:

### Option 1: Using the Setup API (Recommended for First Time)

1. **Create Admin User via API:**
   ```bash
   curl -X POST https://your-domain.com/api/admin/setup \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@example.com", "name": "Your Name"}'
   ```

2. **Or use the browser console:**
   ```javascript
   fetch('/api/admin/setup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       email: 'your-email@example.com',
       name: 'Your Name'
     })
   }).then(r => r.json()).then(console.log)
   ```

3. **Login with Magic Link:**
   - Go to `/login`
   - Enter your email
   - Check your email for the magic link (or use the link returned in development)
   - Click the link to login

### Option 2: Direct Database Update (If you have Supabase access)

1. Go to your Supabase dashboard
2. Navigate to the `users` table
3. Insert a new user or update an existing one:
   ```sql
   INSERT INTO users (email, name, role, status)
   VALUES ('your-email@example.com', 'Your Name', 'admin', 'active');
   
   -- Or update existing user:
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

### Option 3: Using Supabase SQL Editor

Run this SQL in your Supabase SQL Editor:

```sql
-- Create admin user (replace with your email)
INSERT INTO users (email, name, role, status, created_at, updated_at)
VALUES (
  'your-email@example.com',
  'Admin User',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', updated_at = NOW();
```

## Environment Variables for Production

Make sure these are set in your Vercel (or hosting) environment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Magic Link Secret (generate a secure random string)
MAGIC_LINK_SECRET=your-secure-random-secret-key

# App URL (for magic links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Email (Resend)
RESEND_API_KEY=re_...
# Update the "from" email in src/app/api/auth/magic-link/route.ts

# OpenAI (for AI course builder)
OPENAI_API_KEY=sk-...

# Stripe (for course payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing the Course Builder

1. **Login:**
   - Go to `/login`
   - Enter your admin email
   - Click the magic link from your email

2. **Access Admin Dashboard:**
   - After login, go to `/admin/courses`
   - You should see the course management interface

3. **Create Your First Course:**
   - Click "New Course"
   - Fill in course details
   - Use AI assistant to generate content
   - Add modules and lessons
   - Publish when ready

## Security Notes

- **Remove or protect `/api/admin/setup`** after initial setup
- Use a strong `MAGIC_LINK_SECRET` in production
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is kept secret
- Set up proper email domain verification for Resend
- Consider adding rate limiting to magic link endpoint

## Troubleshooting

### Can't login?
- Check that your email is in the `users` table with `role = 'admin'`
- Verify `MAGIC_LINK_SECRET` is set correctly
- Check browser console for errors
- Verify Supabase credentials are correct

### Magic link not working?
- Check that `NEXT_PUBLIC_APP_URL` is set correctly
- Verify the token hasn't expired (24 hour limit)
- Check email spam folder
- In development, the link is returned in the API response

### Can't access admin pages?
- Verify your user has `role = 'admin'` in the database
- Check session is valid (try logging out and back in)
- Clear browser cookies and try again

