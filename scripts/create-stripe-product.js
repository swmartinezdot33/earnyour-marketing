/**
 * Script to create Stripe product for the GMB course
 */

const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");

// Read from .env.local if not in environment
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let stripeKey = process.env.STRIPE_SECRET_KEY;

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
        if (key === "STRIPE_SECRET_KEY") stripeKey = value;
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

if (!stripeKey) {
  console.error("Error: STRIPE_SECRET_KEY must be set");
  console.error("Skipping Stripe product creation. You can create it manually in the admin panel.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const stripe = Stripe(stripeKey);

const COURSE_SLUG = "total-google-my-business-optimization-course";

async function main() {
  try {
    console.log("Checking for course...");
    
    // Get the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", COURSE_SLUG)
      .single();
    
    if (courseError || !course) {
      throw new Error(`Course not found: ${courseError?.message || "Course does not exist"}`);
    }
    
    console.log(`✓ Found course: ${course.title}`);
    console.log(`  Price: $${course.price}`);
    
    // Check if Stripe product already exists
    if (course.stripe_product_id && course.stripe_price_id) {
      console.log("\n✓ Course already has Stripe product linked:");
      console.log(`  Product ID: ${course.stripe_product_id}`);
      console.log(`  Price ID: ${course.stripe_price_id}`);
      
      // Verify it exists in Stripe
      try {
        const product = await stripe.products.retrieve(course.stripe_product_id);
        const price = await stripe.prices.retrieve(course.stripe_price_id);
        console.log(`  Product Name: ${product.name}`);
        console.log(`  Price: $${(price.unit_amount || 0) / 100}`);
        console.log("\n✓ Stripe product is active and linked correctly!");
        return;
      } catch (stripeError) {
        console.log("\n⚠ Stripe product IDs exist but product not found in Stripe");
        console.log("Creating new Stripe product...");
      }
    }
    
    console.log("\nCreating Stripe product...");
    
    // Create Stripe product
    const product = await stripe.products.create({
      name: course.title,
      description: course.short_description || course.description || undefined,
      images: course.image_url ? [course.image_url] : undefined,
      metadata: {
        course_id: course.id,
      },
    });
    
    console.log(`✓ Product created: ${product.id}`);
    
    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(course.price * 100), // Convert to cents
      currency: "usd",
    });
    
    console.log(`✓ Price created: ${price.id} ($${course.price})`);
    
    // Save to database
    const { error: insertError } = await supabase
      .from("stripe_products")
      .insert([{
        course_id: course.id,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
      }]);
    
    if (insertError && !insertError.message.includes("duplicate")) {
      throw new Error(`Failed to save Stripe product: ${insertError.message}`);
    }
    
    // Update course with Stripe IDs
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", course.id);
    
    if (updateError) {
      throw new Error(`Failed to update course: ${updateError.message}`);
    }
    
    console.log("\n✓ Course updated with Stripe product IDs");
    console.log("\n" + "=".repeat(60));
    console.log("Stripe Product Creation Complete!");
    console.log("=".repeat(60));
    console.log(`Product ID: ${product.id}`);
    console.log(`Price ID: ${price.id}`);
    console.log(`Course ID: ${course.id}`);
    console.log(`\nCourse is now ready for Stripe checkout!`);
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

main();




