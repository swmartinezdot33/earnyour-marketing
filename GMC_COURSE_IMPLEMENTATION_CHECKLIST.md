# GMC Course - Implementation Checklist

## Overview
Complete implementation guide for "Total Google My Business Optimization Course"  
**Price:** $39 | **Modules:** 7 | **Lessons:** 33 | **Status:** Ready to Deploy

---

## Phase 1: Database Setup ⚙️

### Prerequisites
- [ ] Environment variables configured (.env.local)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Admin user exists (`steven@earnyour.com`)

### Database Creation
- [ ] Make admin user (if needed):
  ```bash
  node scripts/make-admin.js steven@earnyour.com
  ```
- [ ] Run course creation script:
  ```bash
  node scripts/create-gmb-course.js
  ```
- [ ] Verify course appears in admin dashboard at `/admin/courses`
- [ ] Save the Course ID for reference

**Course Details After Setup:**
- Course ID: `[UUID]`
- Course Slug: `total-google-my-business-optimization-course`
- Modules Created: 7
- Lessons Created: 33
- Status: Unpublished (draft)

---

## Phase 2: Course Configuration 🎨

### Upload Course Image
- [ ] Go to `/admin/courses/[id]/builder`
- [ ] Click "Upload Course Image"
- [ ] Choose image (recommended sizes: 1200x630px for landing page)
- [ ] Recommended images:
  - Google My Business interface screenshot
  - Google Maps pack screenshot
  - Custom GMB course icon
  - Local business success graphic
- [ ] Verify image displays on course card

### Update Course Metadata
- [ ] Title: ✅ `Total Google My Business Optimization Course` (auto-filled)
- [ ] Slug: ✅ `total-google-my-business-optimization-course` (auto-filled)
- [ ] Price: ✅ `39` (auto-filled)
- [ ] Short Description: ✅ Auto-filled
- [ ] Long Description: ✅ Auto-filled

---

## Phase 3: Lesson Content Creation 📝

### Lesson Breakdown (33 Total)

#### Module 1: Introduction (2 lessons)
- [ ] Lesson 1.1: What is GMB and Why It Matters
  - Type: VIDEO
  - Content needed: 3-5 min intro video
  - Topics: Definition, importance, statistics
  - Status: ⏳ Pending

- [ ] Lesson 1.2: How GMB Generates Organic Leads
  - Type: TEXT
  - Content needed: 300-500 words
  - Topics: Lead generation mechanics, conversion paths
  - Status: ⏳ Pending

#### Module 2: Getting Started (4 lessons)
- [ ] Lesson 2.1: Finding Your Existing Listing
  - Type: VIDEO
  - Content needed: 3-5 min walkthrough
  - Topics: Search process, unclaimed listings
  - Status: ⏳ Pending

- [ ] Lesson 2.2: Claiming an Unclaimed Listing
  - Type: VIDEO
  - Content needed: 5-7 min tutorial
  - Topics: Verification methods, common issues
  - Status: ⏳ Pending

- [ ] Lesson 2.3: Creating a New Listing
  - Type: VIDEO
  - Content needed: 5-7 min walkthrough
  - Topics: When to create vs. claim, setup process
  - Status: ⏳ Pending

- [ ] Lesson 2.4: Verification Process Explained
  - Type: VIDEO
  - Content needed: 3-5 min explanation
  - Topics: Postcard verification, phone verification
  - Status: ⏳ Pending

#### Module 3: Profile Optimization (5 lessons)
- [ ] Lesson 3.1: Business Name and Categories
  - Type: VIDEO
  - Content needed: 5-7 min tutorial
  - Topics: Naming format, category selection, mistakes
  - Status: ⏳ Pending

- [ ] Lesson 3.2: Writing the Perfect Description
  - Type: VIDEO
  - Content needed: 4-6 min tutorial
  - Topics: Best practices, keywords, character limits
  - Status: ⏳ Pending

- [ ] Lesson 3.3: Adding All Services
  - Type: VIDEO
  - Content needed: 3-5 min walkthrough
  - Topics: Service listing, categories, pricing
  - Status: ⏳ Pending

- [ ] Lesson 3.4: Contact Information and Hours
  - Type: VIDEO
  - Content needed: 3-5 min tutorial
  - Topics: Phone, website, hours, special hours
  - Status: ⏳ Pending

- [ ] Lesson 3.5: Attributes Selection
  - Type: VIDEO
  - Content needed: 5-7 min walkthrough
  - Topics: Available attributes, importance, industry-specific
  - Status: ⏳ Pending

#### Module 4: Visual Assets (5 lessons)
- [ ] Lesson 4.1: Why Visuals Matter
  - Type: TEXT
  - Content needed: 400-600 words
  - Topics: Algorithm impact, quality standards, benefits
  - Status: ⏳ Pending

- [ ] Lesson 4.2: Logo and Cover Photo
  - Type: VIDEO
  - Content needed: 4-6 min tutorial
  - Topics: Specifications, upload process, best practices
  - Status: ⏳ Pending

- [ ] Lesson 4.3: Essential Photos
  - Type: VIDEO
  - Content needed: 6-8 min walkthrough
  - Topics: Photo types, quality, batch upload, organization
  - Status: ⏳ Pending

- [ ] Lesson 4.4: Video Upload Guide
  - Type: VIDEO
  - Content needed: 4-6 min tutorial
  - Topics: Requirements, upload process, best practices
  - Status: ⏳ Pending

- [ ] Lesson 4.5: Photo Strategy and Schedule
  - Type: TEXT
  - Content needed: 500-800 words + template
  - Topics: Monthly plan, calendar, consistency
  - Status: ⏳ Pending

#### Module 5: Reviews and Reputation (5 lessons)
- [ ] Lesson 5.1: Why Reviews Are Critical
  - Type: TEXT
  - Content needed: 400-600 words
  - Topics: Ranking impact, signals, importance
  - Status: ⏳ Pending

- [ ] Lesson 5.2: Creating Direct Review Links
  - Type: VIDEO
  - Content needed: 3-5 min tutorial
  - Topics: Link generation, sharing, QR codes
  - Status: ⏳ Pending

- [ ] Lesson 5.3: Automated Review Requests
  - Type: VIDEO
  - Content needed: 5-7 min walkthrough
  - Topics: Tools, timing, templates, compliance
  - Status: ⏳ Pending

- [ ] Lesson 5.4: Responding to Reviews
  - Type: VIDEO
  - Content needed: 4-6 min tutorial
  - Topics: Response process, templates, handling negative
  - Status: ⏳ Pending

- [ ] Lesson 5.5: Review Velocity Strategy
  - Type: TEXT
  - Content needed: 400-600 words
  - Topics: Target numbers, frequency, scaling
  - Status: ⏳ Pending

#### Module 6: Posts and Engagement (5 lessons)
- [ ] Lesson 6.1: Why Regular Posts Matter
  - Type: TEXT
  - Content needed: 400-600 words
  - Topics: Frequency impact, engagement, leads
  - Status: ⏳ Pending

- [ ] Lesson 6.2: Creating Effective Posts
  - Type: VIDEO
  - Content needed: 5-7 min tutorial
  - Topics: Interface, content types, CTAs
  - Status: ⏳ Pending

- [ ] Lesson 6.3: Post Types (Updates, Offers, Events)
  - Type: VIDEO
  - Content needed: 5-7 min walkthrough
  - Topics: Each post type, best practices
  - Status: ⏳ Pending

- [ ] Lesson 6.4: Using Posts to Drive Leads
  - Type: VIDEO
  - Content needed: 4-6 min tutorial
  - Topics: Lead generation, CTA optimization, examples
  - Status: ⏳ Pending

- [ ] Lesson 6.5: Posting Schedule and Ideas
  - Type: TEXT
  - Content needed: 600-1000 words + calendar
  - Topics: Frequency, calendar template, 50+ ideas
  - Status: ⏳ Pending

#### Module 7: Q&A and Features (3 lessons)
- [ ] Lesson 7.1: Q&A Management
  - Type: VIDEO
  - Content needed: 4-6 min tutorial
  - Topics: Pre-answering, responding, authority building
  - Status: ⏳ Pending

- [ ] Lesson 7.2: NAP Consistency Basics
  - Type: TEXT
  - Content needed: 300-500 words
  - Topics: What is NAP, why matters, where to check
  - Status: ⏳ Pending

- [ ] Lesson 7.3: Key Directory Listings
  - Type: VIDEO
  - Content needed: 5-7 min walkthrough
  - Topics: Yelp, Bing, Apple Maps, BBB setup
  - Status: ⏳ Pending

---

## Phase 4: Stripe Integration 💳

### Create Stripe Product
- [ ] Go to Stripe Dashboard: https://dashboard.stripe.com
- [ ] Navigate to Products
- [ ] Click "+ Add product"
- [ ] Fill in:
  - Name: `Total Google My Business Optimization Course`
  - Description: Course description
  - Price: `$39.00` (one-time)
  - Billing: `One-time`
- [ ] Click "Save product"

### Get Product IDs
- [ ] Copy **Product ID** (format: `prod_XXXXXXXXXX`)
- [ ] Copy **Price ID** (format: `price_XXXXXXXXXX`)
  - (Click the price in pricing section to find Price ID)

### Link to Course
- [ ] Go to `/admin/courses/[course-id]/builder`
- [ ] Paste `stripe_product_id` in Product ID field
- [ ] Paste `stripe_price_id` in Price ID field
- [ ] Click **Save**

### Test Stripe Integration
- [ ] Visit course landing page
- [ ] Click "Enroll Now" button
- [ ] Verify Stripe checkout appears
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete test purchase
- [ ] Verify success redirect

---

## Phase 5: Pre-Launch Verification ✅

### Course Display
- [ ] Course appears in `/courses` store
- [ ] Course card shows image
- [ ] Course card shows price ($39)
- [ ] Course card shows "View Course" button

### Landing Page
- [ ] Landing page accessible at `/courses/total-google-my-business-optimization-course/landing`
- [ ] Hero section displays correctly
- [ ] Course image loads
- [ ] Title shows correctly
- [ ] Price displays ($39)
- [ ] Benefits section shows
- [ ] Features section shows (4 cards)
- [ ] Curriculum section loads (7 modules)
- [ ] Testimonials section shows
- [ ] FAQ section shows
- [ ] Pricing CTA shows "Enroll Now" button

### Purchase Flow
- [ ] "Enroll Now" button clickable
- [ ] Redirects to Stripe checkout
- [ ] Test purchase succeeds
- [ ] Email confirmation sent
- [ ] User enrolled in course
- [ ] User can access course at `/courses/[slug]/learn`

### Database
- [ ] Course published (`published = true`)
- [ ] All modules have content
- [ ] All lessons have content
- [ ] Stripe IDs linked correctly
- [ ] Course slug is correct

---

## Phase 6: Publishing 🚀

### Final Review
- [ ] All lessons have content (✅ or ⏳ for each)
- [ ] Course image uploaded
- [ ] Stripe IDs correct
- [ ] Price is $39
- [ ] Description accurate
- [ ] Landing page looks good

### Publish Course
- [ ] Go to admin course builder
- [ ] Set `published` toggle to **ON**
- [ ] Click **Save/Publish**
- [ ] Verify course appears in store within 1 minute

### Announce Course
- [ ] Add to marketing emails
- [ ] Update home page (if applicable)
- [ ] Create social media posts
- [ ] Email existing customers
- [ ] Share in relevant communities

---

## Post-Launch Tasks 📊

### Monitor Performance
- [ ] Track daily enrollments
- [ ] Monitor lesson completion rates
- [ ] Collect student feedback
- [ ] Check Stripe payment confirmations

### Improve Content
- [ ] Get testimonials from early students
- [ ] Record video testimonials
- [ ] Update course based on feedback
- [ ] Add FAQ based on questions

### Growth
- [ ] Create lead magnet (GMB checklist)
- [ ] Build email sequence for non-buyers
- [ ] Plan advanced courses
- [ ] Develop GMB + Local SEO bundle

---

## Quick Reference

| Item | Status | Notes |
|------|--------|-------|
| Database Setup | ⏳ | Run script when ready |
| Course Image | ⏳ | Upload in admin |
| Lesson Content | ⏳ | 33 lessons need content |
| Stripe Product | ⏳ | Create $39 product |
| Stripe IDs | ⏳ | Link to course |
| Test Purchase | ⏳ | Verify works |
| Publish | ⏳ | Set published=true |
| Landing Page | ⏳ | Verify displays |
| Announce | ⏳ | After publishing |

---

## File References

- **Setup Guide:** `GMC_COURSE_SETUP_GUIDE.md`
- **Stripe Setup:** `GMC_COURSE_STRIPE_SETUP.md`
- **Script:** `scripts/create-gmb-course.js`
- **Admin Dashboard:** `/admin/courses`
- **Landing Page Template:** See `COURSE_LANDING_PAGE_GUIDE.md`

---

## Support Links

- Admin Courses: `/admin/courses`
- Admin Builder: `/admin/courses/[id]/builder`
- Course Store: `/courses`
- Landing Page: `/courses/total-google-my-business-optimization-course/landing`
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://app.supabase.com

---

**Status:** Ready to Deploy  
**Last Updated:** January 2026  
**Version:** 1.0
