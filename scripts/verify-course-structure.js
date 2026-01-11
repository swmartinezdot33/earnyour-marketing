/**
 * Verify the final course structure
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

async function verify() {
  try {
    console.log("Verifying course structure...\n");
    
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", COURSE_SLUG)
      .single();
    
    if (!course) {
      throw new Error("Course not found");
    }
    
    console.log(`Course: ${course.title}`);
    console.log(`Price: $${course.price}`);
    console.log(`Published: ${course.published ? "Yes" : "No"}\n`);
    
    const { data: modules } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course.id)
      .order("order", { ascending: true });
    
    console.log(`Modules: ${modules?.length || 0}\n`);
    
    let totalLessons = 0;
    const contentTypeCounts = {};
    
    for (const module of modules || []) {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", module.id)
        .order("order", { ascending: true });
      
      totalLessons += lessons?.length || 0;
      
      console.log(`Module ${module.order + 1}: ${module.title}`);
      console.log(`  Lessons: ${lessons?.length || 0}`);
      
      if (lessons) {
        for (const lesson of lessons) {
          const type = lesson.content_type || "unknown";
          contentTypeCounts[type] = (contentTypeCounts[type] || 0) + 1;
          console.log(`    - ${lesson.title} (${type})`);
        }
      }
      console.log();
    }
    
    console.log("=".repeat(60));
    console.log("Summary:");
    console.log("=".repeat(60));
    console.log(`Total Modules: ${modules?.length || 0}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log("\nContent Type Breakdown:");
    for (const [type, count] of Object.entries(contentTypeCounts)) {
      console.log(`  ${type}: ${count}`);
    }
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

verify();




