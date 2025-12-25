# GoHighLevel Whitelabel Account Setup Guide

This guide will walk you through setting up your GHL SaaS platform. You can either **create new subaccounts programmatically** (SaaS model) or **link existing subaccounts** to the EarnYour course platform.

## Prerequisites

### Agency-Level PIT Token (Required for Creating Subaccounts)

If you want to create new GHL subaccounts programmatically (SaaS model), you need an **agency-level PIT token**:

1. Log into your **agency-level** GoHighLevel account
2. Go to **Settings** → **Integrations** → **API**
3. Create a new PIT token with agency-level permissions
4. Set it as `GHL_AGENCY_PIT_TOKEN` in your environment variables

**Your Agency PIT Token:** `pit-cf8f0fb1-7a9c-4ae2-9fd0-56b9ca28519d`

## Step 1: Get Your GHL API Credentials

### Finding Your GHL Location ID

1. Log into your GoHighLevel account
2. Navigate to **Settings** → **Locations** (or **Settings** → **Account** → **Locations**)
3. Click on your location/subaccount
4. The **Location ID** is displayed in the URL or in the location settings
   - It typically looks like: `location_abc123xyz` or just `abc123xyz`
   - You can also find it in the browser URL when viewing a location: `https://app.gohighlevel.com/location/[LOCATION_ID]/...`

### Creating a PIT (Private Integration Token)

1. In your GHL account, go to **Settings** → **Integrations** → **API**
2. Click **"Create New Token"** or **"Generate API Token"**
3. Give it a name like "EarnYour Course Platform"
4. Select the scopes/permissions you need:
   - ✅ **Contacts** (read, write)
   - ✅ **Tags** (read, write)
   - ✅ **Custom Fields** (read, write)
   - ✅ **Pipelines** (read, write)
   - ✅ **Automations** (read, write)
5. Copy the token immediately (you won't be able to see it again!)
   - It will look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (a long JWT token)

**⚠️ Important:** Store this token securely. You'll need it for the next step.

## Step 2: Create Whitelabel Account in Admin Panel

1. **Log into your admin account** at `/admin` (or click "Admin" in the navbar)

2. **Navigate to Whitelabel Accounts:**
   - Click the **"Whitelabel Accounts"** button on the admin courses page
   - Or go directly to `/admin/whitelabel`

3. **Create New Account:**
   - Click **"Create Whitelabel Account"** button
   - You'll see two options:

   **Option A: Create New Subaccount (SaaS Model)**
   - Select the **"Create New Subaccount"** tab
   - Fill in:
     - **Account Name**: e.g., "EarnYour App - Customer Name"
     - **Company Name** (Optional)
     - **Email** (Optional)
     - **Phone** (Optional)
     - **Website** (Optional)
     - **Branding** (Optional): Logo, colors
   - Click **"Create Subaccount & Account"**
   - The system will:
     1. Create a new GHL subaccount under your agency
     2. Generate a PIT token for that subaccount
     3. Create the whitelabel account in the database
   
   **Option B: Link Existing Subaccount**
   - Select the **"Link Existing Subaccount"** tab
   - Fill in:
     - **Account Name**: e.g., "EarnYour App" or "My GHL Subaccount"
     - **GHL Location ID**: Paste your location ID from Step 1
     - **GHL API Token**: Paste your PIT token from Step 1
     - **Branding** (Optional): Logo, colors
   - Click **"Create Account"**

4. **Verify Connection:**
   - You'll be redirected to the account management page
   - The account should show as "Active" status

## Step 3: Set Up GHL Custom Fields

Before the system can track course enrollments and membership status, you need to create these custom fields in your GHL account:

### Required Custom Fields

1. Log into your GHL account
2. Go to **Settings** → **Custom Fields** → **Contact Fields**
3. Create the following fields:

| Field Name | Type | Description |
|------------|------|-------------|
| `enrolled_courses` | Array/List | List of course IDs the contact is enrolled in |
| `membership_status` | Text | Status: `active`, `expired`, `cancelled` |
| `membership_tier` | Text | Tier level: `basic`, `premium`, `enterprise` |
| `total_courses_enrolled` | Number | Count of courses enrolled |
| `total_spent` | Number | Total amount spent on courses |
| `last_course_purchase` | Date | Date of last course purchase |

**Note:** Field names must match exactly (case-sensitive).

## Step 4: Set Up GHL Pipeline (Optional but Recommended)

1. In GHL, go to **Settings** → **Pipelines**
2. Create a new pipeline called **"Course Enrollments"** (or use an existing one)
3. Add stages:
   - New Enrollment
   - Course In Progress
   - Course Completed
   - Certified

4. **Link to Course:**
   - Go to `/admin/courses/[course-id]/ghl` in your admin panel
   - Select the pipeline and default stage
   - Save settings

## Step 5: Assign Users to Whitelabel Account

### For New Course Purchases

When a user purchases a course via Stripe:
- They are automatically synced to GHL as a contact
- Course access is granted via GHL tags
- Custom fields are updated automatically
- Contact is moved to the pipeline stage (if configured)

### Manual Assignment

1. Go to `/admin/whitelabel/[account-id]/users`
2. Click **"Add User"**
3. Search for or select a user
4. They will now have access to view their membership status

## Step 6: Test the Integration

### Test Course Purchase Flow:

1. **Create a test course** in `/admin/courses/new`
2. **Set up Stripe product** (if Stripe is configured)
3. **Purchase the course** as a test user
4. **Check GHL:**
   - Contact should be created/updated
   - Tag `Course: [Course Name]` should be added
   - Custom fields should be populated
   - Contact should be in the pipeline stage

### Test Membership Status:

1. **User logs in** and goes to `/dashboard/membership`
2. **View membership details:**
   - Membership status
   - Enrolled courses
   - Total spent
   - Last purchase date

## How It Works

### When a User Purchases a Course:

1. **Stripe webhook** receives payment confirmation
2. **User is enrolled** in the course (local database)
3. **GHL sync happens:**
   - Contact is created/updated in GHL
   - Course tag is added: `Course: [Course Name]`
   - Custom fields are updated:
     - `enrolled_courses` array updated
     - `total_courses_enrolled` incremented
     - `total_spent` updated
     - `last_course_purchase` set to current date
   - Contact is moved to pipeline stage (if configured)
   - Automation is triggered (if configured)

### When a User Views Their Dashboard:

1. System checks **local database** for enrollments
2. System checks **GHL** for membership status and additional courses
3. User sees combined view of:
   - Courses from local DB
   - Membership status from GHL
   - Total spent and enrolled courses

## Troubleshooting

### "Failed to connect to GHL"

- ✅ Verify your API token is correct and not expired
- ✅ Check that your Location ID is correct
- ✅ Ensure your API token has the required permissions/scopes
- ✅ Test connection at `/admin/ghl/settings`

### "User not found in GHL"

- ✅ User must have a `ghl_contact_id` in the database
- ✅ Contact must exist in your GHL location
- ✅ Check GHL sync logs at `/admin/ghl/settings` (if available)

### "Custom fields not updating"

- ✅ Verify custom field names match exactly (case-sensitive)
- ✅ Ensure custom fields exist in your GHL account
- ✅ Check that your API token has "Custom Fields" write permission

### "Pipeline stage not updating"

- ✅ Verify pipeline ID is correct
- ✅ Check that stage ID exists in the pipeline
- ✅ Ensure your API token has "Pipelines" write permission

## Next Steps

Once your whitelabel account is set up:

1. **Create courses** in `/admin/courses`
2. **Configure GHL integration** per course at `/admin/courses/[id]/ghl`
3. **Set up automations** in GHL to trigger on course enrollment
4. **Monitor sync logs** for any errors
5. **Users can view membership** at `/dashboard/membership`

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for API errors
3. Verify GHL API credentials are correct
4. Test GHL connection at `/admin/ghl/settings`

