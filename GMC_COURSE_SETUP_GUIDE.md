# GMC Course Setup Guide

## Course Overview

**Course Name:** Total Google My Business Optimization Course  
**Slug:** `total-google-my-business-optimization-course`  
**Price:** $39  
**Status:** Ready to deploy

---

## Step-by-Step Setup Instructions

### Step 1: Ensure Admin User Exists

The course creation script requires an admin user. Make sure `steven@earnyour.com` is set as admin:

```bash
# Set steven@earnyour.com as admin
node scripts/make-admin.js steven@earnyour.com
```

**Note:** This requires environment variables to be loaded:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These are in your `.env.local` file (not version controlled for security).

### Step 2: Create Course Structure

Once admin is set up, run the course creation script:

```bash
node scripts/create-gmb-course.js
```

This will:
- Create the course in the database
- Create 7 modules
- Create 33 lessons with proper structure

**Expected Output:**
```
============================================================
Creating Total Google My Business Optimization Course
============================================================
✓ Course created: [course-id]
✓ Module 1 created: Introduction to Google My Business
✓ Module 2 created: Getting Started - Claiming Your Listing
... (and 5 more modules)
✓ Total lessons: 33

Course Creation Complete!
Course ID: [uuid]
Course Slug: total-google-my-business-optimization-course
Modules: 7
Lessons: 33

Next steps:
1. Go to /admin/courses/[id]/builder to add content
2. Upload videos for video lessons
3. Add text content for text lessons
4. Create quizzes for quiz lessons
5. Upload downloadable resources
6. Link Stripe product and publish the course
```

### Step 3: Add Course Image

Go to the admin course builder and upload a course thumbnail image. Recommended options:
- Google Business Profile interface screenshot
- Google Maps pack screenshot
- Custom GMB icon design
- Local business success graphic

**Location:** `/admin/courses/[course-id]/builder`

### Step 4: Add Lesson Content

For each of the 33 lessons, you need to add content based on type:

#### Video Lessons (~25 lessons)
These are best served as videos. Options:
1. **Record your own** using Loom, OBS, or ScreenFlow
2. **Use pre-recorded tutorials** from your library
3. **Embed YouTube videos** if you have them
4. **Link to external resources** (though embedded is better)

Key lessons that should be videos:
- Finding your existing listing
- Claiming an unclaimed listing
- Creating a new listing
- Verification process
- Business name & categories setup
- Writing business description
- Adding services
- Setting contact & hours
- Uploading logo & cover photo
- Uploading photos
- Video upload guide
- Creating direct review links
- Automated review request setup
- Responding to reviews
- Creating GMB posts
- Post types demonstration
- Q&A management
- Directory listings setup

#### Text Lessons (~8 lessons)
These work well as written content:
- Why GMB matters and generates leads
- Why visuals matter for rankings
- Photo strategy & schedule
- Why reviews are critical
- Review velocity strategy
- Why regular posts matter
- Posting schedule & content ideas
- NAP consistency basics

### Step 5: Create Stripe Product

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a new Product:
   - **Name:** Total Google My Business Optimization Course
   - **Description:** Master Google My Business setup and optimization
   - **Price:** $39.00 USD
   - **Recurring:** One-time payment
3. Copy the **Product ID** and **Price ID**

### Step 6: Link Stripe to Course

In the admin course builder:
1. Paste the Stripe Product ID in `stripe_product_id` field
2. Paste the Stripe Price ID in `stripe_price_id` field
3. Save the course

### Step 7: Publish the Course

In the admin course builder:
1. Toggle `published` to **ON**
2. Ensure all required fields are filled:
   - ✅ Title
   - ✅ Description
   - ✅ Price
   - ✅ Image
   - ✅ Stripe IDs
3. Click **Publish**

### Step 8: Verify Landing Page

Visit the live landing page:
```
https://earnyour.com/courses/total-google-my-business-optimization-course/landing
```

You should see:
- Course hero with title and image
- Price display ($39)
- Benefits extracted from description
- Course features (Content, Pace, Skills, Lifetime Access)
- Curriculum preview (7 modules)
- Testimonials section
- FAQ section
- Pricing CTA with "Enroll Now" button

---

## Course Structure Details

### Module 1: Introduction to Google My Business (2 lessons)
1. **What is Google My Business and Why It Matters** [VIDEO]
   - Explain what GMB is
   - Show importance for local businesses
   - Statistics on GMB leads

2. **How GMB Generates Organic Leads** [TEXT]
   - Explain organic lead generation
   - GMB's role in local search
   - Lead conversion paths

### Module 2: Getting Started - Claiming Your Listing (4 lessons)
1. **Finding Your Existing Listing** [VIDEO]
   - Demo: Search for business on Google Maps
   - Show how to find unclaimed listing
   - Tips for multiple locations

2. **Claiming an Unclaimed Listing** [VIDEO]
   - Step-by-step claiming process
   - Verification method options
   - Troubleshooting common issues

3. **Creating a New Listing from Scratch** [VIDEO]
   - When to create vs. claim
   - Complete new listing setup
   - Initial information needed

4. **Verification Process Explained** [VIDEO]
   - Different verification methods
   - Postcard verification walkthrough
   - Phone verification walkthrough

### Module 3: Complete Profile Optimization (5 lessons)
1. **Business Name and Categories** [VIDEO]
   - Correct naming format
   - Primary category selection
   - Secondary categories
   - Common mistakes to avoid

2. **Writing the Perfect Business Description** [VIDEO]
   - Description best practices
   - Keyword incorporation
   - Character limits and formatting
   - Examples of good descriptions

3. **Adding All Services** [VIDEO]
   - Service listing interface
   - Comprehensive service list
   - Service categories
   - Pricing per service (optional)

4. **Contact Information and Hours** [VIDEO]
   - Setting phone number
   - Website URL setup
   - Business hours formatting
   - Special hours (holidays)

5. **Attributes Selection Guide** [VIDEO]
   - Available attributes explained
   - Which attributes matter most
   - Industry-specific attributes
   - How to add attributes

### Module 4: Visual Assets - Photos and Videos (5 lessons)
1. **Why Visuals Matter for Rankings** [TEXT]
   - Google's algorithm and visuals
   - Photo quality impact
   - Video engagement metrics
   - Best practices overview

2. **Logo and Cover Photo Optimization** [VIDEO]
   - Logo specifications
   - Logo upload walkthrough
   - Cover photo requirements
   - Cover photo upload

3. **Essential Photos: Interior, Exterior, Team, and Work** [VIDEO]
   - What photos to take
   - Photo quality standards
   - Batch upload process
   - Organization tips

4. **Video Upload Guide** [VIDEO]
   - Video requirements
   - Upload process
   - Video best practices
   - Optimal length and format

5. **Photo Strategy and Schedule** [TEXT]
   - Monthly photo plan
   - Seasonal considerations
   - Content calendar template
   - Consistency importance

### Module 5: Reviews and Reputation Management (5 lessons)
1. **Why Reviews Are Critical for Rankings** [TEXT]
   - Reviews impact on ranking
   - Review signals Google tracks
   - Star rating importance
   - Recent review velocity

2. **Creating Direct Review Links** [VIDEO]
   - Generate review link
   - Share methods
   - QR code generation
   - Link customization

3. **Automated Review Request Setup** [VIDEO]
   - Tools for automation (SMS/Email)
   - Request timing
   - Message examples
   - Compliance and best practices

4. **Responding to Reviews** [VIDEO]
   - How to respond
   - Response templates
   - Handling negative reviews
   - Professional tone

5. **Review Velocity Strategy** [TEXT]
   - Target number (3-5 per month)
   - Request frequency
   - Seasonal patterns
   - Scaling reviews

### Module 6: Posts and Engagement (5 lessons)
1. **Why Regular Posts Matter** [TEXT]
   - Posting frequency impact
   - Engagement signals
   - Lead generation via posts
   - Content calendar importance

2. **Creating Effective GMB Posts** [VIDEO]
   - Post creation interface
   - Content types
   - Image/video in posts
   - Call-to-action buttons

3. **Post Types: Updates, Offers, Events** [VIDEO]
   - Updates posts
   - Offer/Promotion posts
   - Event posts
   - Best practices per type

4. **Using Posts to Drive Leads** [VIDEO]
   - Lead generation strategy
   - CTA optimization
   - Post examples
   - Tracking performance

5. **Posting Schedule and Content Ideas** [TEXT]
   - Posting frequency (2-3 per week)
   - Content calendar template
   - 50+ post ideas
   - Seasonal content

### Module 7: Q&A and Additional Features (3 lessons)
1. **Q&A Management** [VIDEO]
   - Q&A section overview
   - Pre-answering questions
   - Responding to customer questions
   - Building authority

2. **NAP Consistency Basics** [TEXT]
   - What is NAP (Name, Address, Phone)
   - Why consistency matters
   - Where to check
   - How to fix inconsistencies

3. **Key Directory Listings** [VIDEO]
   - Yelp setup
   - Bing Places setup
   - Apple Maps setup
   - BBB and others

---

## Content Guidelines

### Video Lessons
- **Length:** 3-8 minutes per lesson
- **Format:** MP4, 1080p or 720p minimum
- **Audio:** Clear, professional quality
- **Captions:** Recommended (accessibility)
- **Pacing:** Clear, not too fast
- **Examples:** Show real GMB interfaces

### Text Lessons
- **Length:** 300-800 words
- **Format:** Clear, scannable
- **Lists:** Use bullet points
- **Examples:** Include real examples
- **Images:** Add screenshots where helpful
- **Links:** Link to relevant resources

---

## Testing Checklist

Before publishing, verify:

- [ ] All 33 lessons have content
- [ ] Course image is uploaded
- [ ] Stripe IDs are linked
- [ ] Course price is $39
- [ ] Course slug is correct
- [ ] Published toggle is ON
- [ ] Landing page displays correctly
- [ ] Hero section shows image
- [ ] Curriculum preview loads
- [ ] "Enroll Now" button works
- [ ] Stripe checkout works
- [ ] Course appears in /courses store

---

## Quick Links

- **Admin Course Builder:** `/admin/courses/[id]/builder`
- **Course Store:** `/courses`
- **Course Landing Page:** `/courses/total-google-my-business-optimization-course/landing`
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Supabase Dashboard:** https://app.supabase.com

---

## Troubleshooting

### Script Error: "Admin user not found"
**Solution:** Run `node scripts/make-admin.js steven@earnyour.com` first

### Course not appearing in store
**Solution:** Ensure `published = true` in admin dashboard

### Landing page shows no image
**Solution:** Upload course image in admin course builder

### Checkout button doesn't work
**Solution:** Verify Stripe IDs are correctly linked and valid

### Modules don't show in curriculum preview
**Solution:** Ensure modules have `order` field set correctly (0, 1, 2, etc.)

---

## Next Steps After Publishing

1. **Promote the course** - Add to marketing emails, landing pages
2. **Create lead magnet** - Offer free GMB checklist to build interest
3. **Record testimonials** - Get feedback from early students
4. **Monitor performance** - Track enrollment and completion rates
5. **Iterate content** - Update based on student feedback
6. **Create advanced course** - Build on this foundation (advanced GMB strategies, local SEO combos, etc.)

---

**Status:** Ready to deploy  
**Last Updated:** January 2026  
**Course ID:** Will be assigned after script runs
