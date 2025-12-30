/**
 * Update course description to reflect focused approach
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

async function updateDescription() {
  try {
    const { data: course, error } = await supabase
      .from("courses")
      .update({
        description: "A focused course teaching small businesses how to set up and optimize their Google My Business listing to generate organic Google leads. Learn the essential steps from claiming your listing to optimizing your profile, visuals, reviews, and posts.",
        short_description: "Master Google My Business setup and optimization to generate organic leads. Essential walkthrough course with video tutorials.",
        updated_at: new Date().toISOString(),
      })
      .eq("slug", COURSE_SLUG)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update course: ${error.message}`);
    }
    
    console.log("✓ Course description updated");
    console.log(`\nTitle: ${course.title}`);
    console.log(`Description: ${course.description}`);
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

updateDescription();

