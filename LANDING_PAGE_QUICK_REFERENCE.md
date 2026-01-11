# Course Landing Page - Quick Reference

## Quick Start

### Access a Course Landing Page
```
https://earnyour.com/courses/{course-slug}/landing
```

### Update Store Links (Already Done)
The course store (`/courses`) now automatically:
- Links non-enrolled users to `/courses/[slug]/landing`
- Links enrolled users to `/courses/[slug]/learn`

## File Locations

```
Landing Page Route
└── src/app/courses/[slug]/landing/page.tsx

Landing Page Components
└── src/components/courses/
    ├── CourseLandingTemplate.tsx (Main component)
    └── landing/
        ├── CourseLandingHero.tsx
        ├── CourseBenefits.tsx
        ├── CourseFeatures.tsx
        ├── CourseCurriculum.tsx
        ├── CourseTestimonials.tsx
        ├── CourseFAQ.tsx
        └── CoursePricingCTA.tsx

API Endpoints
└── src/app/api/courses/[id]/modules/route.ts
```

## Common Tasks

### 1. Customize Benefits for a Course
Edit `src/components/courses/landing/CourseBenefits.tsx` to:
- Extract from description (automatic)
- Or pass custom benefits array to component

### 2. Add Course-Specific Testimonials
Edit `src/components/courses/landing/CourseTestimonials.tsx`:
```tsx
const courseTestimonials = [
  {
    quote: "Amazing course!",
    author: "John Doe",
    role: "Course Graduate",
    rating: 5
  }
];

<CourseTestimonials testimonials={courseTestimonials} />
```

### 3. Add Course-Specific FAQs
Edit `src/components/courses/landing/CourseFAQ.tsx`:
```tsx
const courseFaqs = [
  { question: "...", answer: "..." }
];

<CourseFAQ courseTitle={course.title} faqs={courseFaqs} />
```

### 4. Disable a Section
In `src/components/courses/CourseLandingTemplate.tsx`:
```tsx
{/* Comment out to hide section */}
{/* <CourseBenefits benefits={benefits} /> */}
```

### 5. Change Section Order
In `src/components/courses/CourseLandingTemplate.tsx`, reorder the component calls.

### 6. Modify Section Content
Each section is its own component in `src/components/courses/landing/`.
Edit the component directly to change styling, content, or layout.

## Styling Reference

### Colors
- `brand-navy` - Primary text/headings
- `primary` - Buttons, accents, icons
- `accent` - Sand background variant
- `white/80` - Secondary text
- `text-white` - Hero section text

### Responsive Classes
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Grid layouts
- `text-3xl md:text-4xl lg:text-5xl` - Responsive text sizes
- `pt-24 pb-16 md:pt-32 md:pb-24` - Responsive padding
- `gap-6 md:gap-8 lg:gap-12` - Responsive gaps

### Common Patterns
```tsx
// Responsive heading
<h2 className="text-3xl md:text-4xl font-bold font-heading">
  Title
</h2>

// Feature card
<Card className="border-none shadow-sm">
  <CardHeader>
    <Icon className="h-6 w-6 text-primary" />
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-brand-navy/70">{description}</p>
  </CardContent>
</Card>

// Check item list
<div className="flex gap-3 items-center">
  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
  <span>{text}</span>
</div>
```

## Testing URLs

### Store Page
```
http://localhost:3000/courses
```

### Landing Page (Replace with real course slug)
```
http://localhost:3000/courses/google-ads/landing
```

### Modules API (For debugging)
```
http://localhost:3000/api/courses/{course-id}/modules
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Landing page not found | Course must be published (`published = true`) |
| No modules showing | Check API endpoint returns data |
| Styling looks wrong | Clear Tailwind cache, restart dev server |
| Images not loading | Verify `image_url` is set in course |
| Purchase button broken | Check Stripe configuration |

## Database Fields Used

| Field | Usage |
|-------|-------|
| `title` | Hero heading |
| `slug` | URL parameter |
| `short_description` | Hero subheading |
| `description` | Benefits extraction, about section |
| `price` | Pricing display |
| `image_url` | Hero image |
| `published` | Visibility check |

## Component Props

### CourseLandingTemplate
```tsx
interface CourseLandingTemplateProps {
  course: Course;
  enrolled: boolean;
  courseSlug: string;
}
```

### CourseLandingHero
```tsx
interface CourseLandingHeroProps {
  course: Course;
  enrolled: boolean;
  courseSlug: string;
}
```

### CourseBenefits
```tsx
interface CourseBenefitsProps {
  benefits: string[];
}
```

### CourseTestimonials
```tsx
interface CourseTestimonialsProps {
  testimonials?: Testimonial[];
}
```

### CourseFAQ
```tsx
interface CourseFAQProps {
  courseTitle: string;
  faqs?: Array<{ question: string; answer: string }>;
}
```

## Key Dependencies

- `@supabase/supabase-js` - Database access
- `framer-motion` - Animations (used in existing components)
- `lucide-react` - Icons
- `shadcn/ui` - UI components
- Tailwind CSS - Styling

## Related Documentation

- `COURSE_LANDING_PAGE_GUIDE.md` - Full guide with customization details
- `LANDING_PAGE_IMPLEMENTATION_SUMMARY.md` - Implementation details and architecture
