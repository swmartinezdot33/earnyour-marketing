# EarnYour GHL Integration - Setup & Flow Recap

## Architecture Overview

### Two Types of Users

1. **Regular Users (Non-SaaS Customers)**
   - No `whitelabel_id` (null)
   - Created as **contacts** in default location: `GQOh2EMzgc3bRAfN7Q9j`
   - Do NOT have a subaccount
   - ALL course enrollments, memberships, and marketing happens in the default location

2. **Whitelabel SaaS Customers**
   - Have a `whitelabel_id` assigned
   - Created in their own GHL subaccount
   - Use whitelabel's API token and location
   - Full subaccount access
   - Only used when someone purchases the whitelabel SaaS GHL product

## Environment Variables Setup

```env
# Default GHL location for regular users (courses, memberships, marketing)
GHL_DEFAULT_LOCATION_ID=GQOh2EMzgc3bRAfN7Q9j

# Default GHL API token for the default location
GHL_API_TOKEN=your-default-location-pit-token

# Agency-level PIT token (for creating subaccounts)
GHL_AGENCY_PIT_TOKEN=pit-cf8f0fb1-7a9c-4ae2-9fd0-56b9ca28519d
```

## User Flow: Regular Users

### 1. User Signs Up
```
User logs in via magic link
  ↓
getOrCreateUser() creates user in local DB
  - email: user@example.com
  - whitelabel_id: null (regular user)
  ↓
syncUserToGHL() automatically called
  ↓
Contact created in GHL location: GQOh2EMzgc3bRAfN7Q9j
  - ghl_contact_id: saved to user record
  - ghl_location_id: GQOh2EMzgc3bRAfN7Q9j
```

### 2. User Purchases Course
```
User purchases course via Stripe
  ↓
Stripe webhook received
  ↓
enrollUserInCourse() - User enrolled in local DB
  ↓
handleCoursePurchase() called
  ↓
syncEnrollmentToGHL() called
  ↓
Contact found/created in GHL location: GQOh2EMzgc3bRAfN7Q9j
  ↓
Course access granted:
  - Tag added: "Course: [Course Name]"
  - Custom fields updated:
    * enrolled_courses: [course_id]
    * total_courses_enrolled: 1
    * total_spent: $99
    * last_course_purchase: 2026-01-15
  ↓
Contact moved to pipeline stage (if configured)
  ↓
Automation triggered (if configured)
```

### 3. User Views Dashboard
```
User goes to /dashboard
  ↓
System checks:
  - Local DB for enrollments
  - GHL location: GQOh2EMzgc3bRAfN7Q9j for membership status
  ↓
User sees:
  - Enrolled courses
  - Membership status from GHL
  - Total spent
  - Course progress
```

## User Flow: Whitelabel SaaS Customers

### 1. Customer Purchases Whitelabel SaaS GHL
```
Admin creates whitelabel account:
  - Go to /admin/whitelabel/new
  - Select "Create New Subaccount" tab
  - Fill in customer details
  ↓
System creates:
  - New GHL subaccount via agency API
  - PIT token for that subaccount
  - Whitelabel account record in DB
  ↓
User assigned to whitelabel:
  - assignUserToWhitelabel(userId, whitelabelId)
  - User's whitelabel_id set
```

### 2. Whitelabel Customer Signs Up
```
User logs in via magic link
  ↓
getOrCreateUser() creates user in local DB
  - email: customer@example.com
  - whitelabel_id: [whitelabel-account-id]
  ↓
syncUserToGHL() automatically called
  ↓
getUserGHLLocationId() checks:
  - User has whitelabel_id ✓
  - Returns whitelabel's location (not default)
  ↓
Contact created in whitelabel's GHL subaccount
  - Uses whitelabel's API token
  - Uses whitelabel's location ID
```

### 3. Whitelabel Customer Purchases Course
```
Same flow as regular user, BUT:
  - Contact created/updated in whitelabel's subaccount
  - Course tags added in whitelabel's subaccount
  - Custom fields updated in whitelabel's subaccount
  - Pipeline stages in whitelabel's subaccount
  - Automations in whitelabel's subaccount
```

## Key Functions & Their Logic

### `getUserGHLLocationId(userId)`
```typescript
1. Check if user has whitelabel_id
   - YES → Return whitelabel's location
   - NO → Return DEFAULT_SAAS_LOCATION_ID (GQOh2EMzgc3bRAfN7Q9j)
```

### `getGHLClientForUser(userId)`
```typescript
1. Get location ID (via getUserGHLLocationId)
2. Check if user has whitelabel_id
   - YES → Use whitelabel's API token + location
   - NO → Use default GHL_API_TOKEN + default location
3. Return GHLClient instance
```

### `syncUserToGHL(userId)`
```typescript
1. Get user from DB
2. Get appropriate GHL client (via getGHLClientForUser)
3. Create/update contact in GHL
4. Save ghl_contact_id and ghl_location_id to user record
```

### `syncEnrollmentToGHL(enrollmentId)`
```typescript
1. Get enrollment data (user + course)
2. Get appropriate GHL client for user
3. Create/update contact in GHL
4. Grant course access (tags + custom fields)
5. Move to pipeline stage (if configured)
6. Trigger automation (if configured)
7. Log sync success
```

## Database Schema

### Users Table
```sql
- id: UUID
- email: TEXT
- name: TEXT
- role: admin | student
- whitelabel_id: UUID (nullable) ← Key field!
  - NULL = Regular user (uses default location)
  - NOT NULL = Whitelabel SaaS customer (uses whitelabel location)
- ghl_contact_id: TEXT (nullable)
- ghl_location_id: TEXT (nullable)
```

### Whitelabel Accounts Table
```sql
- id: UUID
- owner_id: UUID (admin who created it)
- name: TEXT (e.g., "EarnYour App - Customer Name")
- ghl_location_id: TEXT (the GHL subaccount location ID)
- ghl_api_token: TEXT (PIT token for that subaccount)
- branding: JSONB (logo, colors)
- status: active | suspended | pending
```

## Location Decision Logic

```
User Action
  ↓
Check: Does user have whitelabel_id?
  ↓
YES → Whitelabel SaaS Customer
  ├─ Use whitelabel's location
  ├─ Use whitelabel's API token
  └─ All operations in whitelabel subaccount
  ↓
NO → Regular User
  ├─ Use default location: GQOh2EMzgc3bRAfN7Q9j
  ├─ Use default GHL_API_TOKEN
  └─ All operations in default location
```

## Important Points

1. **Default Location is Primary**
   - `GQOh2EMzgc3bRAfN7Q9j` is where ALL regular user activity happens
   - Courses, memberships, marketing - everything for regular users

2. **Whitelabel is Optional**
   - Only used when someone purchases whitelabel SaaS GHL
   - Regular users never get a whitelabel_id
   - Whitelabel subaccounts are separate from regular operations

3. **Automatic Routing**
   - System automatically determines location based on `whitelabel_id`
   - No manual configuration needed per user
   - Regular users always go to default location

4. **Contact vs Subaccount**
   - Regular users = Contacts in default location
   - Whitelabel customers = Contacts in their own subaccount
   - Both are contacts, but in different locations

## Admin Actions

### Create Whitelabel Account
```
1. Go to /admin/whitelabel/new
2. Select "Create New Subaccount"
3. Fill in customer details
4. System creates:
   - GHL subaccount
   - PIT token
   - Whitelabel record
```

### Assign User to Whitelabel
```
1. Go to /admin/whitelabel/[id]/users
2. Click "Add User"
3. Select user
4. User gets whitelabel_id assigned
5. Future GHL operations use whitelabel location
```

### View User's GHL Status
```
1. Go to /admin/users/[id]/ghl
2. See:
   - GHL contact ID
   - Location (default or whitelabel)
   - Enrolled courses
   - Membership status
   - Custom fields
```

## Testing Checklist

- [ ] Regular user signup → Contact created in default location
- [ ] Regular user course purchase → Synced to default location
- [ ] Whitelabel account creation → Subaccount created in GHL
- [ ] Whitelabel user assignment → User gets whitelabel_id
- [ ] Whitelabel user course purchase → Synced to whitelabel location
- [ ] User dashboard → Shows correct membership status
- [ ] Course enrollment → Tags and custom fields updated correctly

## Troubleshooting

**User not in GHL?**
- Check if `syncUserToGHL()` was called on signup
- Check `ghl_contact_id` in users table
- Verify GHL_API_TOKEN is set correctly

**User in wrong location?**
- Check user's `whitelabel_id` field
- Verify whitelabel account exists if whitelabel_id is set
- Check `getUserGHLLocationId()` return value

**Course not syncing?**
- Check enrollment record exists
- Verify GHL sync logs in `ghl_sync_logs` table
- Check if custom fields exist in GHL
- Verify API token has correct permissions










