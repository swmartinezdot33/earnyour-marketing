/**
 * Clean up duplicate lessons to match streamlined structure
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

const COURSE_SLUG = "total-google-my-business-optimization-course";

// Expected lessons per module (streamlined structure)
const EXPECTED_LESSONS = {
  "Introduction to Google My Business": [
    "What is Google My Business and Why It Matters",
    "How GMB Generates Organic Leads",
  ],
  "Getting Started - Claiming Your Listing": [
    "Finding Your Existing Listing",
    "Claiming an Unclaimed Listing",
    "Creating a New Listing from Scratch",
    "Verification Process Explained",
  ],
  "Complete Profile Optimization": [
    "Business Name and Categories",
    "Writing the Perfect Business Description",
    "Adding All Services",
    "Contact Information and Hours",
    "Attributes Selection Guide",
  ],
  "Visual Assets - Photos and Videos": [
    "Why Visuals Matter for Rankings",
    "Logo and Cover Photo Optimization",
    "Essential Photos: Interior, Exterior, Team, and Work",
    "Video Upload Guide",
    "Photo Strategy and Schedule",
  ],
  "Reviews and Reputation Management": [
    "Why Reviews Are Critical for Rankings",
    "Creating Direct Review Links",
    "Automated Review Request Setup",
    "Responding to Reviews",
    "Review Velocity Strategy",
  ],
  "Posts and Engagement": [
    "Why Regular Posts Matter",
    "Creating Effective GMB Posts",
    "Post Types: Updates, Offers, Events",
    "Using Posts to Drive Leads",
    "Posting Schedule and Content Ideas",
  ],
  "Q&A and Additional Features": [
    "Q&A Management",
    "NAP Consistency Basics",
    "Key Directory Listings",
  ],
};

async function cleanup() {
  try {
    console.log("Finding course...");
    
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", COURSE_SLUG)
      .single();
    
    if (!course) {
      throw new Error("Course not found");
    }
    
    const { data: modules } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course.id)
      .order("order", { ascending: true });
    
    console.log(`Found ${modules?.length || 0} modules\n`);
    
    let totalDeleted = 0;
    
    for (const module of modules || []) {
      const expectedTitles = EXPECTED_LESSONS[module.title] || [];
      
      if (expectedTitles.length === 0) {
        console.log(`Skipping module: ${module.title} (no expected lessons defined)`);
        continue;
      }
      
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", module.id)
        .order("order", { ascending: true });
      
      if (!lessons || lessons.length === 0) continue;
      
      console.log(`\nModule: ${module.title}`);
      console.log(`  Expected: ${expectedTitles.length} lessons`);
      console.log(`  Current: ${lessons.length} lessons`);
      
      // Find lessons to delete (not in expected list)
      const lessonsToDelete = lessons.filter(l => !expectedTitles.includes(l.title));
      
      if (lessonsToDelete.length > 0) {
        console.log(`  Deleting ${lessonsToDelete.length} duplicate/old lessons...`);
        
        for (const lesson of lessonsToDelete) {
          // Delete lesson content
          await supabase.from("lesson_content").delete().eq("lesson_id", lesson.id);
          // Delete lesson
          await supabase.from("lessons").delete().eq("id", lesson.id);
          console.log(`    ⊘ Removed: ${lesson.title}`);
          totalDeleted++;
        }
      }
      
      // Reorder remaining lessons
      const { data: remainingLessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", module.id)
        .order("order", { ascending: true });
      
      for (let i = 0; i < remainingLessons.length; i++) {
        const lesson = remainingLessons[i];
        const expectedTitle = expectedTitles[i];
        
        if (lesson.title === expectedTitle && lesson.order !== i) {
          await supabase
            .from("lessons")
            .update({ order: i, updated_at: new Date().toISOString() })
            .eq("id", lesson.id);
        }
      }
      
      console.log(`  ✓ Module cleaned up`);
    }
    
    console.log(`\n✓ Cleanup complete! Removed ${totalDeleted} duplicate lessons`);
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

cleanup();

