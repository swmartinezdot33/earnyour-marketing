/**
 * Script to clean up old modules and lessons not in the streamlined course structure
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

// New streamlined module titles
const KEEP_MODULES = [
  "Introduction to Google My Business",
  "Getting Started - Claiming Your Listing",
  "Complete Profile Optimization",
  "Visual Assets - Photos and Videos",
  "Reviews and Reputation Management",
  "Posts and Engagement",
  "Q&A and Additional Features",
];

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
    
    console.log(`✓ Found course: ${course.id}\n`);
    
    // Get all modules
    const { data: allModules } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course.id)
      .order("order", { ascending: true });
    
    if (!allModules || allModules.length === 0) {
      console.log("No modules found");
      return;
    }
    
    console.log(`Found ${allModules.length} modules\n`);
    
    // Find modules to delete
    const modulesToDelete = allModules.filter(m => !KEEP_MODULES.includes(m.title));
    
    if (modulesToDelete.length === 0) {
      console.log("✓ No old modules to remove");
      return;
    }
    
    console.log(`Removing ${modulesToDelete.length} old modules:\n`);
    
    for (const module of modulesToDelete) {
      console.log(`Removing: ${module.title}`);
      
      // Get lessons for this module
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("module_id", module.id);
      
      if (lessons && lessons.length > 0) {
        console.log(`  - Deleting ${lessons.length} lessons...`);
        
        for (const lesson of lessons) {
          // Delete lesson content
          await supabase.from("lesson_content").delete().eq("lesson_id", lesson.id);
        }
        
        // Delete lessons
        await supabase.from("lessons").delete().eq("module_id", module.id);
      }
      
      // Delete module
      await supabase.from("modules").delete().eq("id", module.id);
      console.log(`  ✓ Removed\n`);
    }
    
    // Reorder remaining modules
    console.log("Reordering modules...");
    const { data: remainingModules } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course.id)
      .order("order", { ascending: true });
    
    for (let i = 0; i < remainingModules.length; i++) {
      const module = remainingModules[i];
      const expectedTitle = KEEP_MODULES[i];
      
      if (module.title === expectedTitle && module.order !== i) {
        await supabase
          .from("modules")
          .update({ order: i, updated_at: new Date().toISOString() })
          .eq("id", module.id);
        console.log(`  ✓ Updated order for: ${module.title}`);
      }
    }
    
    console.log("\n✓ Cleanup complete!");
    console.log(`\nRemaining modules: ${remainingModules.length}`);
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

cleanup();




