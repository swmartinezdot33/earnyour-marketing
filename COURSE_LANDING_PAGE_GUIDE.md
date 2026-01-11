# Course Landing Page Template Guide

## Overview

A comprehensive, reusable landing page template system has been created for all courses. Each course now has a dedicated sales funnel landing page at `/courses/[slug]/landing` that's completely separate from the course learning interface.

## Features

### Sections
The landing page includes the following customizable sections:

1. **Hero Section** - Course title, image, description, price, and purchase CTA
2. **Benefits Section** - Auto-extracted from course description or manually customizable
3. **Features Section** - Pre-built feature highlights (content, pace, skills, lifetime access)
4. **Curriculum Preview** - Shows all course modules dynamically loaded from the database
5. **Testimonials Section** - Includes default testimonials (can be overridden per course)
6. **FAQ Section** - General course FAQs (can be customized per course)
7. **Pricing CTA** - Final conversion-focused section with pricing, benefits list, and purchase button

### Responsive Design
- Mobile-first responsive design using Tailwind CSS
- All sections properly scaled for mobile, tablet, and desktop
- Touch-friendly buttons and interactive elements

### SEO Optimized
- Metadata generation with course title and description
- OpenGraph support for social sharing
- Proper heading hierarchy and semantic HTML

## File Structure

```
src/
├── app/
│   └── courses/
│       ├── [slug]/
│       │   ├── landing/
│       │   │   └── page.tsx (Landing page route)
│       │   ├── learn/
│       │   │   └── ... (Course learning interface)
│       │   └── page.tsx (Course overview - kept for reference)
│       └── page.tsx (Updated to link to landing pages)
│
└── components/
    └── courses/
        ├── CourseLandingTemplate.tsx (Main template orchestrator)
        ├── PurchaseButton.tsx (Existing purchase component)
        ├── landing/
        │   ├── CourseLandingHero.tsx (Hero section)
        │   ├── CourseBenefits.tsx (Benefits section)
        │   ├── CourseFeatures.tsx (Features section)
        │   ├── CourseCurriculum.tsx (Curriculum preview)
        │   ├── CourseTestimonials.tsx (Testimonials)
        │   ├── CourseFAQ.tsx (FAQ section)
        │   └── CoursePricingCTA.tsx (Final CTA)
        │
        └── api/
            └── courses/
                └── [id]/
                    └── modules/
                        └── route.ts (API for fetching modules)
```

## Usage

### Basic Implementation
The landing page is automatically available at `/courses/[slug]/landing` for any published course. No additional configuration is needed.

### Store Page Updates
The course store page (`/courses`) now has updated links:
- For enrolled users: Links to `/courses/[slug]/learn` (learning interface)
- For non-enrolled users: Links to `/courses/[slug]/landing` (sales page)

### Customization Options

#### 1. Custom Benefits
By default, benefits are extracted from the course description. To customize:

Edit `CourseLandingTemplate.tsx` and modify the `extractBenefits` function or pass custom props.

#### 2. Custom Testimonials
Replace the default testimonials by modifying `CourseTestimonials.tsx`:
```tsx
<CourseTestimonials 
  testimonials={customTestimonials}
/>
```

#### 3. Custom FAQs
Customize FAQs by modifying `CourseFAQ.tsx`:
```tsx
<CourseFAQ 
  courseTitle={course.title}
  faqs={customFaqs}
/>
```

#### 4. Disable Sections
In `CourseLandingTemplate.tsx`, simply comment out or conditionally render sections:
```tsx
{/* <CourseBenefits benefits={benefits} /> */}
```

## Database Integration

### Course Data
The landing page uses existing course fields:
- `title` - Course name
- `slug` - URL slug
- `short_description` - Tagline (used in hero)
- `description` - Full description (used for benefits extraction)
- `price` - Course price
- `image_url` - Hero image

### Modules Data
The Curriculum section fetches modules via the `/api/courses/[id]/modules` endpoint:
- Displays all modules in order
- Shows module title and description
- Dynamically loads from database

## Styling & Design System

### Colors
- **Primary Navy**: `brand-navy` - Used for text and headings
- **Primary Accent**: `primary` - Used for buttons and highlights
- **Sand Background**: `accent` - Used for alternate sections
- **White**: Default background

### Typography
- **Headings**: Uses `font-heading` with bold weight
- **Body**: Standard font-family with proper line-height
- **Responsive**: Font sizes scale from mobile to desktop

### Spacing
- Uses Tailwind's spacing scale consistently
- Sections have proper padding (py-12 md:py-16 lg:py-24)
- Content max-widths for readability

### Components Used
- Existing shadcn/ui components (Card, Button, Accordion)
- Container and Section layout components
- Lucide icons for visual interest

## Navigation Flow

### User Flow - Non-Enrolled
1. User visits `/courses` (store page)
2. Clicks "View Course" on a course card
3. Lands on `/courses/[slug]/landing` (sales page)
4. Scrolls through benefits, features, curriculum, testimonials, FAQ
5. Clicks "Enroll Now" button
6. Completes purchase via Stripe
7. Redirected to `/courses/[slug]/learn` (learning interface)

### User Flow - Enrolled
1. User visits `/courses` (store page)
2. Clicks "Continue" on a course card (they're already enrolled)
3. Linked directly to `/courses/[slug]/learn` (learning interface)

## API Endpoints

### GET /api/courses/[id]/modules
Returns all modules for a course, ordered by module order.

**Response:**
```json
[
  {
    "id": "module-uuid",
    "title": "Module Name",
    "description": "Module description",
    "order": 1
  }
]
```

## Performance Considerations

- Hero image is optimized with aspect-ratio container
- Curriculum modules load asynchronously with loading state
- All components are client-rendered for smooth interactions
- No blocking server calls in critical path

## Future Enhancements

1. **Database Configuration**
   - Add `landing_config` field to courses table to control which sections display
   - Add course-specific testimonials table
   - Add course-specific FAQ table

2. **Analytics**
   - Track landing page views
   - Track conversion from landing to purchase
   - A/B test landing page variations

3. **Content Variants**
   - Different hero backgrounds per course
   - Custom section content per course
   - Course-specific bonus materials display

4. **Social Proof**
   - Student count display
   - Enrollment counter
   - Recent enrollments feed

## Troubleshooting

### Landing page shows 404
- Ensure the course is published (`published = true`)
- Check the course slug matches the URL

### Curriculum section not loading
- Verify the API endpoint is working: `/api/courses/[course-id]/modules`
- Check that modules exist in the database for the course
- Check browser console for errors

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that color variables (brand-navy, primary, etc.) are defined in tailwind.config.ts
- Verify Container and Section components are imported correctly

## Testing

To test the landing page:

1. Visit `/courses` to see the course store
2. Click a course card to view its landing page
3. Verify all sections load correctly
4. Test responsive design at different breakpoints
5. Test purchase button functionality
6. Test links to continue learning (if enrolled)
