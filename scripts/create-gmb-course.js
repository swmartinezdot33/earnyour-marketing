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
    .single();
  
  if (error || !data) {
    throw new Error("User not found. Please ensure steven@earnyour.com exists.");
  }
  
  return data.id;
}

// Course structure from the plan
const courseData = {
  title: "Total Google My Business Optimization Course",
  slug: "total-google-my-business-optimization-course",
  description: "A focused course teaching small businesses how to set up and optimize their Google My Business listing to generate organic Google leads. Learn the essential steps from claiming your listing to optimizing your profile, visuals, reviews, and posts.",
  short_description: "Master Google My Business setup and optimization to generate organic leads. Essential walkthrough course with video tutorials.",
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
    ],
  },
  {
    title: "Getting Started - Claiming Your Listing",
    description: "Step-by-step guide to finding, claiming, and verifying your Google My Business listing",
    lessons: [
      { title: "Finding Your Existing Listing", content_type: "video", description: "How to search for and locate your existing GMB listing" },
      { title: "Claiming an Unclaimed Listing", content_type: "video", description: "Walkthrough of claiming a listing that already exists but isn't claimed" },
      { title: "Creating a New Listing from Scratch", content_type: "video", description: "Complete guide to creating a brand new GMB listing" },
      { title: "Verification Process Explained", content_type: "video", description: "Understanding the verification process and what to expect" },
    ],
  },
  {
    title: "Complete Profile Optimization",
    description: "Comprehensive guide to optimizing every section of your GMB profile for maximum visibility",
    lessons: [
      { title: "Business Name and Categories", content_type: "video", description: "How to format your business name and choose the right primary and secondary categories" },
      { title: "Writing the Perfect Business Description", content_type: "video", description: "Crafting a keyword-rich, compelling business description" },
      { title: "Adding All Services", content_type: "video", description: "Step-by-step guide to listing all your services for maximum visibility" },
      { title: "Contact Information and Hours", content_type: "video", description: "Setting up phone, website, address, and business hours correctly" },
      { title: "Attributes Selection Guide", content_type: "video", description: "Choosing the right attributes for your business type" },
    ],
  },
  {
    title: "Visual Assets - Photos and Videos",
    description: "Master the visual elements that make your GMB listing stand out and rank higher",
    lessons: [
      { title: "Why Visuals Matter for Rankings", content_type: "text", description: "Understanding how photos and videos impact your GMB ranking" },
      { title: "Logo and Cover Photo Optimization", content_type: "video", description: "How to upload and optimize your logo and cover photo" },
      { title: "Essential Photos: Interior, Exterior, Team, and Work", content_type: "video", description: "What photos to take and how to upload them effectively" },
      { title: "Video Upload Guide", content_type: "video", description: "How to upload videos to your GMB listing" },
      { title: "Photo Strategy and Schedule", content_type: "text", description: "Creating a consistent photo upload schedule that boosts rankings" },
    ],
  },
  {
    title: "Reviews and Reputation Management",
    description: "Build and manage your online reputation to boost rankings and trust",
    lessons: [
      { title: "Why Reviews Are Critical for Rankings", content_type: "text", description: "Understanding how reviews impact your GMB ranking" },
      { title: "Creating Direct Review Links", content_type: "video", description: "Step-by-step guide to creating direct review links" },
      { title: "Automated Review Request Setup", content_type: "video", description: "How to automate review requests from customers" },
      { title: "Responding to Reviews", content_type: "video", description: "Best practices for responding to both positive and negative reviews" },
      { title: "Review Velocity Strategy", content_type: "text", description: "How many reviews you need and when to request them" },
    ],
  },
  {
    title: "Posts and Engagement",
    description: "Use GMB posts to drive engagement and generate leads",
    lessons: [
      { title: "Why Regular Posts Matter", content_type: "text", description: "How posting regularly impacts your visibility" },
      { title: "Creating Effective GMB Posts", content_type: "video", description: "Walkthrough of creating posts that drive action" },
      { title: "Post Types: Updates, Offers, Events", content_type: "video", description: "Understanding different post types and when to use them" },
      { title: "Using Posts to Drive Leads", content_type: "video", description: "Strategies for creating posts that generate leads" },
      { title: "Posting Schedule and Content Ideas", content_type: "text", description: "How often to post and content ideas that work" },
    ],
  },
  {
    title: "Q&A and Additional Features",
    description: "Leverage Q&A and other features to provide value and improve rankings",
    lessons: [
      { title: "Q&A Management", content_type: "video", description: "How to pre-answer questions and respond to customer questions effectively" },
      { title: "NAP Consistency Basics", content_type: "text", description: "Ensuring your Name, Address, Phone is consistent across the web" },
      { title: "Key Directory Listings", content_type: "video", description: "Setting up listings on Yelp, Bing, and Apple Maps" },
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

