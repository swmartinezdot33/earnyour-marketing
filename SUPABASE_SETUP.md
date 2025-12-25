# Supabase Database Setup - EarnYour Marketing Project ✅

## New Project Created & Configured

**Project ID:** `tmhetngbdqklqddueugo`  
**Project Name:** EarnYour Marketing  
**Region:** us-east-1  
**API URL:** `https://tmhetngbdqklqddueugo.supabase.co`  
**Status:** ✅ ACTIVE_HEALTHY

## API Keys

### Publishable Key (for client-side)
```env
NEXT_PUBLIC_SUPABASE_URL=https://tmhetngbdqklqddueugo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaGV0bmdiZHFrbHFkZHVldWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzU0MDksImV4cCI6MjA4MjAxMTQwOX0.WkBhRzgHJrotVPjhzv3wqyo47PqZWHYrPQYQwwHGlLY
```

### Service Role Key
⚠️ **You need to get this from Supabase Dashboard:**
1. Go to https://supabase.com/dashboard/project/tmhetngbdqklqddueugo/settings/api
2. Copy the "service_role" key (keep this secret!)

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Database Setup Complete ✅

All 10 course platform tables have been successfully created:

1. ✅ `users` - User accounts (email-based auth) - **1 admin user created**
2. ✅ `courses` - Course metadata
3. ✅ `modules` - Course modules/chapters
4. ✅ `lessons` - Individual lessons
5. ✅ `lesson_content` - Lesson content (video, text, quiz, etc.)
6. ✅ `enrollments` - User course enrollments
7. ✅ `progress` - User progress tracking
8. ✅ `certificates` - Generated certificates
9. ✅ `stripe_products` - Stripe product mappings
10. ✅ `stripe_purchases` - Purchase records

## Admin User Created ✅

An admin user has been created:
- **Email:** `admin@earnyour.com`
- **Role:** `admin`
- **Name:** Admin User

You can log in with this email to access the admin dashboard.

## Next Steps

1. **Get Service Role Key** from Supabase Dashboard:
   - https://supabase.com/dashboard/project/tmhetngbdqklqddueugo/settings/api
   - Copy the "service_role" key

2. **Update `.env.local`** with the credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tmhetngbdqklqddueugo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaGV0bmdiZHFrbHFkZHVldWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzU0MDksImV4cCI6MjA4MjAxMTQwOX0.WkBhRzgHJrotVPjhzv3wqyo47PqZWHYrPQYQwwHGlLY
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Test the connection**:
   ```bash
   npm run dev
   ```
   - Visit `/login`
   - Enter `admin@earnyour.com`
   - Check your email for the magic link

4. **Create your first course**:
   - After logging in, visit `/admin/courses/new`
   - Start building your course content!

## Project Dashboard

Access your project dashboard:
https://supabase.com/dashboard/project/tmhetngbdqklqddueugo

## Cost

This project costs **$10/month** (Pro plan).

## Migration Applied

Migration name: `create_course_platform_schema`  
Status: ✅ Successfully applied

All tables have:
- ✅ Proper indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Foreign key constraints
- ✅ Check constraints for data validation

**The database is ready to use! 🚀**
