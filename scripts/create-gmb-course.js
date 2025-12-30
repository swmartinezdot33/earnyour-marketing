/**
 * Script to create the "Total Google My Business Optimization Course"
 * This script creates the course, all modules, and all lessons programmatically
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read from .env.local if not in environment
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
    envFile.split("\n").forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = value;
        if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = value;
      }
    });
  } catch (e) {
    console.error("Could not read .env.local file");
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Get admin user ID (steven@earnyour.com)
async function getAdminUserId() {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", "steven@earnyour.com")
    .eq("role", "admin")
    .single();
  
  if (error || !data) {
    throw new Error("Admin user not found. Please ensure steven@earnyour.com exists as admin.");
  }
  
  return data.id;
}

// Course structure from the plan
const courseData = {
  title: "Total Google My Business Optimization Course",
  slug: "total-google-my-business-optimization-course",
  description: "A comprehensive course teaching small businesses how to set up, optimize, and maintain their Google My Business listing to generate organic Google leads. Learn everything from claiming your listing to advanced optimization strategies that drive real results.",
  short_description: "Master Google My Business optimization to generate organic leads for your small business. Complete walkthrough course with video tutorials.",
  price: 39,
  image_url: null,
  published: false,
};

const modules = [
  {
    title: "Introduction to Google My Business",
    description: "Learn what Google My Business is and why it's critical for generating organic leads",
    lessons: [
      { title: "What is Google My Business and Why It Matters", content_type: "video", description: "Introduction to GMB and its importance for local businesses" },
      { title: "How GMB Generates Organic Leads", content_type: "text", description: "Understanding how optimized GMB listings drive organic traffic and leads" },
      { title: "Course Overview and What You'll Learn", content_type: "video", description: "Overview of the complete course structure and learning objectives" },
    ],
  },
  {
    title: "Getting Started - Claiming Your Listing",
    description: "Step-by-step guide to finding, claiming, and verifying your Google My Business listing",
    lessons: [
      { title: "Finding Your Existing Listing", content_type: "video", description: "How to search for and locate your existing GMB listing" },
      { title: "Claiming an Unclaimed Listing", content_type: "video", description: "Walkthrough of claiming a listing that already exists but isn't claimed" },
      { title: "Creating a New Listing from Scratch", content_type: "video", description: "Complete guide to creating a brand new GMB listing" },
      { title: "Verification Process Explained", content_type: "text", description: "Understanding the verification process and what to expect" },
      { title: "Common Verification Issues and Solutions", content_type: "text", description: "Troubleshooting common verification problems" },
    ],
  },
  {
    title: "Complete Profile Setup",
    description: "Comprehensive guide to filling out every section of your GMB profile for maximum optimization",
    lessons: [
      { title: "Business Name Best Practices", content_type: "text", description: "How to properly format your business name for GMB" },
      { title: "Choosing the Right Primary Category", content_type: "video", description: "Video walkthrough of selecting the optimal primary category" },
      { title: "Selecting Secondary Categories", content_type: "video", description: "How to choose and add relevant secondary categories" },
      { title: "Writing the Perfect Business Description", content_type: "text", description: "Crafting a keyword-rich, compelling business description" },
      { title: "Adding All Services", content_type: "video", description: "Step-by-step guide to listing all your services" },
      { title: "Setting Business Hours Correctly", content_type: "video", description: "How to set and manage business hours including special hours" },
      { title: "Contact Information Setup", content_type: "video", description: "Setting up phone, website, and address information" },
      { title: "Attributes Selection Guide", content_type: "video", description: "Choosing the right attributes for your business type" },
      { title: "Module 3 Quiz: Profile Completeness Check", content_type: "quiz", description: "Test your knowledge of profile setup best practices" },
    ],
  },
  {
    title: "Visual Assets - Photos and Videos",
    description: "Master the visual elements that make your GMB listing stand out and rank higher",
    lessons: [
      { title: "Why Visuals Matter for Rankings", content_type: "text", description: "Understanding how photos and videos impact your GMB ranking" },
      { title: "Logo Upload Best Practices", content_type: "video", description: "How to upload and optimize your business logo" },
      { title: "Cover Photo Optimization", content_type: "video", description: "Creating an effective cover photo that represents your business" },
      { title: "Interior Photos Strategy", content_type: "video", description: "What interior photos to take and how to upload them" },
      { title: "Exterior Photos Strategy", content_type: "video", description: "Best practices for exterior and storefront photos" },
      { title: "Team Photos That Convert", content_type: "video", description: "How to showcase your team effectively" },
      { title: "Work/Service Photos", content_type: "video", description: "Documenting your work and services through photos" },
      { title: "Video Upload Guide", content_type: "video", description: "How to upload videos to your GMB listing" },
      { title: "Photo Upload Schedule and Strategy", content_type: "text", description: "Creating a consistent photo upload schedule" },
      { title: "Downloadable: Photo Checklist Template", content_type: "download", description: "Checklist template for managing your GMB photos" },
    ],
  },
  {
    title: "Services and Categories Deep Dive",
    description: "Advanced strategies for optimizing your services and category selections",
    lessons: [
      { title: "Service Listing Best Practices", content_type: "video", description: "How to list services for maximum visibility" },
      { title: "Adding Service Descriptions", content_type: "video", description: "Writing compelling service descriptions" },
      { title: "Service Area Configuration", content_type: "video", description: "Setting up your service areas correctly" },
      { title: "Multiple Location Setup", content_type: "text", description: "Managing GMB for businesses with multiple locations" },
      { title: "Category Research Tools", content_type: "text", description: "Tools and strategies for finding the best categories" },
    ],
  },
  {
    title: "Reviews and Reputation Management",
    description: "Build and manage your online reputation to boost rankings and trust",
    lessons: [
      { title: "Why Reviews Are Critical for Rankings", content_type: "text", description: "Understanding how reviews impact your GMB ranking" },
      { title: "Creating Direct Review Links", content_type: "video", description: "Step-by-step guide to creating direct review links" },
      { title: "Automated Review Request Setup", content_type: "video", description: "How to automate review requests from customers" },
      { title: "Responding to Positive Reviews", content_type: "video", description: "Best practices for responding to positive reviews" },
      { title: "Handling Negative Reviews Professionally", content_type: "video", description: "How to respond to negative reviews effectively" },
      { title: "Review Velocity Strategy", content_type: "text", description: "How many reviews you need and when" },
      { title: "Review Generation Automation Tools", content_type: "text", description: "Tools and platforms for automating review requests" },
      { title: "Downloadable: Review Response Templates", content_type: "download", description: "Templates for responding to different types of reviews" },
    ],
  },
  {
    title: "Posts and Engagement",
    description: "Use GMB posts to drive engagement and generate leads",
    lessons: [
      { title: "Why Regular Posts Matter", content_type: "text", description: "How posting regularly impacts your visibility" },
      { title: "Creating Effective GMB Posts", content_type: "video", description: "Walkthrough of creating posts that drive action" },
      { title: "Post Types: Updates, Offers, Events", content_type: "video", description: "Understanding different post types and when to use them" },
      { title: "Posting Schedule and Frequency", content_type: "text", description: "How often to post and best times" },
      { title: "Using Posts to Drive Leads", content_type: "video", description: "Strategies for creating posts that generate leads" },
      { title: "Post Content Ideas and Templates", content_type: "text", description: "Content ideas and templates for regular posting" },
      { title: "Downloadable: 30-Day Posting Calendar", content_type: "download", description: "30-day calendar with post ideas and schedule" },
    ],
  },
  {
    title: "Q&A Management",
    description: "Leverage the Q&A section to provide value and improve rankings",
    lessons: [
      { title: "Setting Up Q&A Section", content_type: "video", description: "How to access and manage the Q&A section" },
      { title: "Pre-Answering Common Questions", content_type: "video", description: "Strategically answering common questions before customers ask" },
      { title: "Responding to Customer Questions", content_type: "video", description: "Best practices for responding to customer questions" },
      { title: "Q&A Best Practices", content_type: "text", description: "Tips for maintaining an effective Q&A section" },
    ],
  },
  {
    title: "NAP Consistency and Citations",
    description: "Ensure your business information is consistent across the web",
    lessons: [
      { title: "What is NAP and Why It Matters", content_type: "text", description: "Understanding Name, Address, Phone consistency" },
      { title: "NAP Audit Process", content_type: "video", description: "How to audit your NAP across all platforms" },
      { title: "Major Directory Listings", content_type: "video", description: "Setting up listings on Yelp, Bing, Apple Maps" },
      { title: "Industry-Specific Directories", content_type: "text", description: "Finding and claiming industry-specific directory listings" },
      { title: "Local Citation Building", content_type: "text", description: "Building local citations for better rankings" },
      { title: "Downloadable: Citation Checklist", content_type: "download", description: "Complete checklist for building citations" },
    ],
  },
  {
    title: "Advanced Optimization Strategies",
    description: "Take your GMB optimization to the next level with advanced features",
    lessons: [
      { title: "Google Posts vs. Website Content", content_type: "text", description: "Understanding the relationship between GMB posts and website SEO" },
      { title: "Booking Integration Setup", content_type: "video", description: "How to integrate booking systems with GMB" },
      { title: "Messaging and Chat Features", content_type: "video", description: "Setting up and managing GMB messaging" },
      { title: "Product Showcase (if applicable)", content_type: "video", description: "How to showcase products in your GMB listing" },
      { title: "Special Attributes for Your Industry", content_type: "video", description: "Industry-specific attributes and how to use them" },
      { title: "Module 10 Quiz: Advanced Features Check", content_type: "quiz", description: "Test your knowledge of advanced GMB features" },
    ],
  },
  {
    title: "Analytics and Insights",
    description: "Understand and use GMB analytics to improve your performance",
    lessons: [
      { title: "Understanding GMB Insights", content_type: "video", description: "Complete walkthrough of the GMB Insights dashboard" },
      { title: "Key Metrics to Track", content_type: "text", description: "Which metrics matter most for your business" },
      { title: "Search Queries Analysis", content_type: "video", description: "How to analyze and use search query data" },
      { title: "Customer Action Tracking", content_type: "video", description: "Understanding how customers interact with your listing" },
      { title: "Photo Performance Metrics", content_type: "text", description: "How to track which photos perform best" },
      { title: "Using Insights to Improve", content_type: "text", description: "Turning insights into actionable improvements" },
    ],
  },
  {
    title: "Maintenance and Ongoing Strategy",
    description: "Long-term strategies for maintaining and improving your GMB listing",
    lessons: [
      { title: "Weekly GMB Maintenance Checklist", content_type: "video", description: "Weekly tasks to keep your listing optimized" },
      { title: "Monthly Optimization Tasks", content_type: "text", description: "Monthly maintenance and optimization checklist" },
      { title: "Staying Ahead of Algorithm Changes", content_type: "text", description: "How to adapt to Google's algorithm updates" },
      { title: "Long-Term GMB Strategy", content_type: "video", description: "Building a sustainable long-term GMB strategy" },
      { title: "Downloadable: Complete GMB Maintenance Calendar", content_type: "download", description: "Complete calendar with all maintenance tasks" },
      { title: "Final Course Quiz: Complete Optimization Assessment", content_type: "quiz", description: "Comprehensive quiz covering all course material" },
    ],
  },
];

async function createCourse() {
  console.log("Checking for existing course...");
  
  // Check if course already exists
  const { data: existingCourse } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseData.slug)
    .single();
  
  if (existingCourse) {
    console.log(`✓ Course already exists: ${existingCourse.id}`);
    return existingCourse;
  }
  
  console.log("Creating new course...");
  const adminUserId = await getAdminUserId();
  
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .insert([{
      ...courseData,
      created_by: adminUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (courseError) {
    throw new Error(`Failed to create course: ${courseError.message}`);
  }
  
  console.log(`✓ Course created: ${course.id}`);
  return course;
}

async function createModules(courseId) {
  console.log("\nChecking for existing modules...");
  
  // Get existing modules
  const { data: existingModules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order", { ascending: true });
  
  if (existingModules && existingModules.length > 0) {
    console.log(`✓ Found ${existingModules.length} existing modules`);
    // Match existing modules with our structure
    const matchedModules = [];
    for (let i = 0; i < modules.length; i++) {
      const moduleData = modules[i];
      const existing = existingModules.find(m => m.title === moduleData.title);
      if (existing) {
        matchedModules.push(existing);
      } else {
        // Create missing module
        const { data: module, error: moduleError } = await supabase
          .from("modules")
          .insert([{
            course_id: courseId,
            title: moduleData.title,
            description: moduleData.description,
            order: i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();
        
        if (moduleError) {
          throw new Error(`Failed to create module "${moduleData.title}": ${moduleError.message}`);
        }
        
        console.log(`✓ Module ${i + 1} created: ${moduleData.title}`);
        matchedModules.push(module);
      }
    }
    return matchedModules;
  }
  
  console.log("Creating modules...");
  const createdModules = [];
  
  for (let i = 0; i < modules.length; i++) {
    const moduleData = modules[i];
    
    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .insert([{
        course_id: courseId,
        title: moduleData.title,
        description: moduleData.description,
        order: i,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (moduleError) {
      throw new Error(`Failed to create module "${moduleData.title}": ${moduleError.message}`);
    }
    
    console.log(`✓ Module ${i + 1} created: ${moduleData.title}`);
    createdModules.push(module);
  }
  
  return createdModules;
}

async function createLessons(createdModules) {
  console.log("\nCreating lessons...");
  let totalLessons = 0;
  let createdCount = 0;
  let skippedCount = 0;
  
  for (let moduleIndex = 0; moduleIndex < createdModules.length; moduleIndex++) {
    const module = createdModules[moduleIndex];
    const moduleData = modules[moduleIndex];
    const lessons = moduleData.lessons;
    
    console.log(`\nCreating lessons for Module ${moduleIndex + 1}: ${moduleData.title}`);
    
    // Get existing lessons for this module
    const { data: existingLessons } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", module.id)
      .order("order", { ascending: true });
    
    for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
      const lessonData = lessons[lessonIndex];
      
      // Check if lesson already exists
      const existing = existingLessons?.find(l => l.title === lessonData.title);
      if (existing) {
        skippedCount++;
        console.log(`  ⊘ Lesson ${lessonIndex + 1} already exists: ${lessonData.title}`);
        continue;
      }
      
      // Update content_type to include new types
      let contentType = lessonData.content_type;
      if (contentType === "quiz") contentType = "quiz";
      else if (contentType === "download") contentType = "download";
      else if (contentType === "video") contentType = "video";
      else contentType = "text";
      
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .insert([{
          module_id: module.id,
          title: lessonData.title,
          description: lessonData.description,
          content_type: contentType,
          order: lessonIndex,
          duration_minutes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (lessonError) {
        throw new Error(`Failed to create lesson "${lessonData.title}": ${lessonError.message}`);
      }
      
      totalLessons++;
      createdCount++;
      console.log(`  ✓ Lesson ${lessonIndex + 1} created: ${lessonData.title}`);
    }
  }
  
  console.log(`\n✓ Total lessons: ${totalLessons} (${createdCount} created, ${skippedCount} skipped)`);
  return totalLessons;
}

async function main() {
  try {
    console.log("=".repeat(60));
    console.log("Creating Total Google My Business Optimization Course");
    console.log("=".repeat(60));
    
    const course = await createCourse();
    const createdModules = await createModules(course.id);
    const totalLessons = await createLessons(createdModules);
    
    console.log("\n" + "=".repeat(60));
    console.log("Course Creation Complete!");
    console.log("=".repeat(60));
    console.log(`Course ID: ${course.id}`);
    console.log(`Course Slug: ${course.slug}`);
    console.log(`Modules: ${createdModules.length}`);
    console.log(`Lessons: ${totalLessons}`);
    console.log(`\nNext steps:`);
    console.log(`1. Go to /admin/courses/${course.id}/builder to add content`);
    console.log(`2. Upload videos for video lessons`);
    console.log(`3. Add text content for text lessons`);
    console.log(`4. Create quizzes for quiz lessons`);
    console.log(`5. Upload downloadable resources`);
    console.log(`6. Link Stripe product and publish the course`);
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

main();

