# Course Landing Page - Visual Structure

## Landing Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVBAR / HEADER                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    HERO SECTION                              │
│  ┌──────────────────────┬──────────────────────────────────┐ │
│  │                      │                                   │ │
│  │  • Course Title      │                                   │ │
│  │  • Description       │        Course Image               │ │
│  │  • Price ($XXX)      │        (Responsive)              │ │
│  │  • [Enroll] [Details]│                                   │ │
│  │                      │                                   │ │
│  └──────────────────────┴──────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              BENEFITS SECTION                                │
│  What You'll Get                                             │
│                                                               │
│  ✓ Benefit #1                                               │
│  ✓ Benefit #2                                               │
│  ✓ Benefit #3                                               │
│  ✓ Benefit #4                                               │
│  ✓ Benefit #5                                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           FEATURES SECTION (Sand background)                │
│  Course Features                                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  📖 Content  │  │  ⚡ Pace     │  │  🎯 Skills   │       │
│  │              │  │              │  │              │       │
│  │  Description │  │  Description │  │  Description │       │
│  │              │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐                                            │
│  │  🏆 Lifetime │                                            │
│  │              │                                            │
│  │  Description │                                            │
│  │              │                                            │
│  └──────────────┘                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           CURRICULUM SECTION                                 │
│  Course Curriculum                                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 1  Module Title #1                                       ││
│  │    Module description text here                          ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 2  Module Title #2                                       ││
│  │    Module description text here                          ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 3  Module Title #3                                       ││
│  │    Module description text here                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│        TESTIMONIALS SECTION (Sand background)               │
│  What Students Say                                           │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ ⭐⭐⭐⭐⭐  │  │ ⭐⭐⭐⭐⭐  │  │ ⭐⭐⭐⭐⭐  │       │
│  │              │  │              │  │              │       │
│  │ "Great       │  │ "Amazing     │  │ "Worth       │       │
│  │  course..."  │  │  content..." │  │  every       │       │
│  │              │  │              │  │  penny..."   │       │
│  │ John Doe     │  │ Jane Smith   │  │ Bob Wilson   │       │
│  │ Owner        │  │ Manager      │  │ Entrepreneur │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              FAQ SECTION                                     │
│  Frequently Asked Questions                                  │
│                                                               │
│  ❓ Do I need prior knowledge?                               │
│  └─ No, this course is designed for complete beginners...   │
│                                                               │
│  ❓ How long does it take?                                   │
│  └─ Most students complete it in 2-4 weeks...              │
│                                                               │
│  ❓ Can I access on mobile?                                  │
│  └─ Yes, all materials are fully responsive...             │
│                                                               │
│  ❓ What if I don't like it?                                 │
│  └─ We offer support within the first 30 days...           │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            FINAL CTA SECTION (Navy background)              │
│                                                               │
│            Ready to Get Started?                             │
│     Join students mastering these skills                     │
│                                                               │
│           ┌──────────────────────────────────┐              │
│           │         $XXX ONE-TIME PAYMENT     │              │
│           │ Lifetime access to all materials │              │
│           │                                   │              │
│           │ ✓ Lifetime Access                │              │
│           │ ✓ Learn at Your Pace             │              │
│           │ ✓ Completion Certificate         │              │
│           │                                   │              │
│           │      [ENROLL NOW] [MORE INFO]    │              │
│           └──────────────────────────────────┘              │
│                                                               │
│     Not sure? Contact us before enrolling.                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FOOTER / CTA                              │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (< 768px)
```
- Hero: Single column (text over image)
- Features: 1 column grid
- Testimonials: Stack vertically
- All buttons full-width
```

### Tablet (768px - 1024px)
```
- Hero: 2 column (text left, image right)
- Features: 2 column grid
- Testimonials: 3 column grid
- Buttons auto-width
```

### Desktop (> 1024px)
```
- All sections: Full optimization
- Features: 2 column grid (max 4 items)
- Testimonials: 3 column grid
- Enhanced spacing and typography
```

## Component Composition Tree

```
CourseLandingTemplate
├── CourseLandingHero
│   ├── Section (navy gradient)
│   ├── Container
│   ├── Grid layout
│   ├── Course title (H1)
│   ├── Course description (P)
│   ├── Price display
│   ├── Buttons
│   │   ├── PurchaseButton (if not enrolled)
│   │   └── Continue Learning (if enrolled)
│   └── Hero image
│
├── CourseBenefits
│   ├── Section
│   ├── Container
│   ├── Title (H2)
│   └── Benefit items (CheckCircle2 icon + text)
│
├── CourseFeatures
│   ├── Section (sand background)
│   ├── Container
│   ├── Title (H2)
│   └── 4 Feature Cards
│       ├── Icon
│       ├── Title
│       └── Description
│
├── CourseCurriculum
│   ├── Section
│   ├── Container
│   ├── Title (H2)
│   ├── Loading state
│   └── Module list
│       ├── Module number badge
│       ├── Module title
│       └── Module description
│
├── CourseTestimonials
│   ├── Section (sand background)
│   ├── Container
│   ├── Title (H2)
│   └── 3 Testimonial Cards
│       ├── Star rating
│       ├── Quote text
│       ├── Author name
│       └── Author role
│
├── CourseFAQ
│   ├── Section
│   ├── Container
│   ├── Title (H2)
│   └── Accordion
│       ├── FAQ question (Trigger)
│       └── FAQ answer (Content)
│
└── CoursePricingCTA
    ├── Section (navy gradient)
    ├── Container
    ├── Title (H2)
    ├── Subtitle (P)
    ├── Pricing box
    │   ├── Price display
    │   ├── Description
    │   ├── Benefit checklist
    │   └── Button
    └── Risk-free guarantee text
```

## State Management

```
Landing Page Route (/courses/[slug]/landing)
├── Fetch course data (server-side)
├── Check user enrollment status
└── Pass to CourseLandingTemplate
    └── CourseCurriculum (client-side)
        ├── useState: modules, loading
        ├── useEffect: fetch /api/courses/[id]/modules
        └── Render with state
```

## Data Flow

```
Browser Request
└── /courses/[slug]/landing
    │
    ├── generateMetadata()
    │   └── getCourseBySlug() → Metadata
    │
    └── CourseLandingPage()
        ├── getCourseBySlug() → Course data
        ├── getSession() → User session
        ├── isUserEnrolled() → Boolean
        │
        └── CourseLandingTemplate
            │
            ├── CourseLandingHero → Renders with course data
            ├── CourseBenefits → Extracted from description
            ├── CourseFeatures → Static features
            ├── CourseCurriculum → Async fetch
            │   └── /api/courses/[id]/modules → Module data
            ├── CourseTestimonials → Default testimonials
            ├── CourseFAQ → Default FAQs
            └── CoursePricingCTA → Renders with course data
```

## Styling Layers

```
Base Layer (Tailwind Config)
├── Colors: brand-navy, primary, accent, etc.
├── Typography: font-heading, default font
└── Spacing: Standard Tailwind scale

Component Layer
├── Section (py-12 md:py-16 lg:py-24)
├── Container (max-w-7xl px-4)
├── Grid layouts (responsive columns)
└── Card components

Theme Layer
├── Hero: Navy gradient background
├── Features: Sand background (accent)
├── Testimonials: Sand background (accent)
├── CTA: Navy gradient background
└── Default: White background

Interactive Layer
├── Buttons: Hover states
├── Accordion: Expand/collapse
├── Links: Hover underline
└── Icons: Scale on hover
```

## SEO Structure

```
<html>
<head>
  <title>Course Title | EarnYour Marketing</title>
  <meta name="description" content="Course description...">
  <meta property="og:title" content="Course Title">
  <meta property="og:description" content="Course description...">
  <meta property="og:image" content="course-image-url">
</head>
<body>
  <h1>Course Title</h1>
  <h2>What You'll Get</h2>
  <h2>Course Features</h2>
  <h2>Course Curriculum</h2>
  <h2>What Students Say</h2>
  <h2>Frequently Asked Questions</h2>
  <h2>Ready to Get Started?</h2>
</body>
</html>
```
