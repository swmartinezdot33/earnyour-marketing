# EarnYour App - SaaS Model Documentation

## Overview

EarnYour App is a **whitelabeled SaaS version of GoHighLevel**. You can create and manage GHL subaccounts programmatically for your customers, all branded as "EarnYour App."

## Architecture

### User Types

**SaaS Customers (Whitelabel Users):**
- Have a `whitelabel_id` assigned
- Created in their own GHL subaccount
- Use whitelabel's API token and location
- Full subaccount access

**Regular Users (Non-SaaS Customers):**
- No `whitelabel_id` (null)
- Created as **contacts** in default location: `GQOh2EMzgc3bRAfN7Q9j`
- Do NOT have a subaccount ID
- Just contacts in the SaaS management location
- **ALL course enrollments, memberships, and marketing happens in this default location**
- We only use whitelabel subaccounts when someone purchases the whitelabel SaaS GHL product

### Agency-Level Setup

You operate at the **agency level** in GoHighLevel, which allows you to:
- Create unlimited subaccounts for SaaS customers
- Manage all subaccounts from one place
- Generate API tokens for each subaccount
- Track usage and billing across all subaccounts
- Regular users are just contacts in your default location

### Your Agency PIT Token

**Token:** `pit-cf8f0fb1-7a9c-4ae2-9fd0-56b9ca28519d`

This token is used for:
- Creating new GHL subaccounts
- Listing all subaccounts
- Generating PIT tokens for subaccounts
- Managing subaccount settings

**Environment Variable:** `GHL_AGENCY_PIT_TOKEN`

## How It Works

### 1. Customer Signs Up

**For SaaS Customers (Whitelabel):**
When a SaaS customer signs up:
1. System creates a new GHL subaccount
2. Generates a PIT token for that subaccount
3. Creates a whitelabel account record
4. User is assigned `whitelabel_id`
5. Customer gets access to their "EarnYour App" instance

**For Regular Users (Non-SaaS):**
When a regular user signs up:
1. User is created in local database (no whitelabel assignment)
2. User is synced to GHL as a **contact** in default location: `GQOh2EMzgc3bRAfN7Q9j`
3. User does NOT get a subaccount - they're just a contact
4. User can purchase courses, but they're managed in the default location

### 2. Customer Uses EarnYour App

**SaaS Customers:**
- Customer logs into your platform
- Views their courses and membership status
- All data syncs to their GHL subaccount
- They never see or interact with GHL directly
- Everything is branded as "EarnYour App"

**Regular Users:**
- User logs into your platform
- Views their courses and membership status
- All data syncs to GHL as contacts in default location: `GQOh2EMzgc3bRAfN7Q9j`
- They're just contacts, not subaccounts
- Can purchase courses and access content

### 3. You Manage Everything

- View all subaccounts in `/admin/whitelabel`
- Manage users per subaccount
- Track course enrollments and purchases
- Monitor GHL sync status
- Handle billing and subscriptions

## Creating Subaccounts

### Via Admin Panel

1. Go to `/admin/whitelabel/new`
2. Select **"Create New Subaccount"** tab
3. Fill in customer details
4. System automatically:
   - Creates GHL subaccount
   - Generates PIT token
   - Sets up whitelabel account
   - Configures branding

### Via API (Future)

You can also create subaccounts programmatically via API endpoints (to be implemented).

## Customer Experience

### What Customers See

- **Branded Platform:** "EarnYour App" (your branding)
- **Course Catalog:** Browse and purchase courses
- **Dashboard:** View enrolled courses, progress, certificates
- **Membership Status:** See their tier, enrolled courses, total spent
- **No GHL Access:** They never log into GoHighLevel

### What Happens Behind the Scenes

- **Course Purchase:**
  1. Stripe processes payment
  2. User enrolled in course (local DB)
  3. Contact created/updated in GHL subaccount
  4. Course tag added: `Course: [Course Name]`
  5. Custom fields updated (enrolled_courses, total_spent, etc.)
  6. Contact moved to pipeline stage
  7. Automation triggered (if configured)

- **Course Progress:**
  - Progress tracked in local DB
  - Completion synced to GHL
  - Certificate generated
  - GHL tags updated

## GHL Custom Fields

Each subaccount needs these custom fields (created automatically or manually):

| Field Name | Type | Purpose |
|------------|------|---------|
| `enrolled_courses` | Array | List of course IDs |
| `membership_status` | Text | active, expired, cancelled |
| `membership_tier` | Text | basic, premium, enterprise |
| `total_courses_enrolled` | Number | Count of courses |
| `total_spent` | Number | Total amount spent |
| `last_course_purchase` | Date | Last purchase date |

## Billing Model

### Option 1: You Bill Customers

- Customer pays you for courses/subscriptions
- You pay GHL for subaccount usage
- You keep the margin

### Option 2: Pass-Through Billing

- Customer pays you
- You create GHL subaccount
- Customer billed directly by GHL (future feature)

## Security

- **Agency Token:** Stored securely in environment variables
- **Subaccount Tokens:** Generated per subaccount, stored encrypted
- **RLS Policies:** Database access controlled per user
- **API Rate Limits:** Respect GHL API rate limits

## Monitoring

### Admin Dashboard

- View all subaccounts: `/admin/whitelabel`
- See user assignments: `/admin/whitelabel/[id]/users`
- Check GHL sync logs: `/admin/ghl/settings`
- Monitor course enrollments: `/admin/courses`

### GHL Dashboard

- Log into your agency GHL account
- View all subaccounts
- Monitor usage per subaccount
- Manage billing and limits

## Next Steps

1. **Set Environment Variable:**
   ```bash
   GHL_AGENCY_PIT_TOKEN=pit-cf8f0fb1-7a9c-4ae2-9fd0-56b9ca28519d
   ```

2. **Create Your First Subaccount:**
   - Go to `/admin/whitelabel/new`
   - Use "Create New Subaccount" tab
   - Test with a test customer

3. **Set Up Custom Fields:**
   - Create custom fields in GHL (or automate this)
   - Verify they're being populated correctly

4. **Test Course Purchase Flow:**
   - Create a test course
   - Purchase as a test user
   - Verify GHL sync works
   - Check membership status page

5. **Configure Automations:**
   - Set up GHL automations for course enrollments
   - Create welcome sequences
   - Set up completion workflows

## Support

For issues:
- Check GHL API documentation: https://highlevel.stoplight.io/docs/integrations
- Review sync logs in admin panel
- Test GHL connection at `/admin/ghl/settings`
- Check browser console and server logs

