# Quick Start - Login & Test in Production

## Step 1: Create Your Admin Account

### Option A: Use the Setup API (Easiest)

Open your browser console on your production site and run:

```javascript
fetch('/api/admin/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'your-email@example.com',
    name: 'Your Name'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Setup result:', data);
  if (data.success) {
    alert('Admin user created! Now login with magic link.');
  }
});
```

### Option B: Direct SQL (If you have Supabase access)

Go to Supabase SQL Editor and run:

```sql
INSERT INTO users (email, name, role, status, created_at, updated_at)
VALUES (
  'your-email@example.com',
  'Your Name',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET role = 'admin', updated_at = NOW();
```

## Step 2: Login

1. Go to `/login` on your production site
2. Enter your email address
3. Click "Send Magic Link"
4. **In Development**: The link will be shown in the response
5. **In Production**: Check your email for the magic link
6. Click the link to login
7. You'll be redirected to `/admin/courses`

## Step 3: Test the Course Builder

1. Click "New Course" to create your first course
2. Use the AI assistant to generate course content
3. Add modules and lessons
4. Upload media and create rich content
5. Preview your course
6. Publish when ready!

## Troubleshooting

**Can't login?**
- Make sure your email has `role = 'admin'` in the database
- Check that `MAGIC_LINK_SECRET` environment variable is set
- Verify Supabase credentials are correct

**Magic link not working?**
- Check `NEXT_PUBLIC_APP_URL` is set to your production domain
- Links expire after 24 hours - request a new one
- In development, the link is returned in the API response

**No email received?**
- Check spam folder
- Verify `RESEND_API_KEY` is set
- In development, the link is shown in the console/response

## Environment Variables Needed

Make sure these are set in Vercel/hosting:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
MAGIC_LINK_SECRET=... (generate a secure random string)
NEXT_PUBLIC_APP_URL=https://your-domain.com
RESEND_API_KEY=... (for email)
OPENAI_API_KEY=... (for AI course builder)
```

That's it! You're ready to build courses! 🚀

