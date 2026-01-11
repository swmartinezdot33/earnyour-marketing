/**
 * Script to update a user to admin role
 * Usage: node scripts/make-admin.js steven@earnyour.com
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

async function makeAdmin() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Find user by email
  const { data: user, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (findError) {
    if (findError.code === "PGRST116") {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    throw findError;
  }

  // Update user to admin
  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("id", user.id)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating user:", updateError);
    process.exit(1);
  }

  console.log(`✅ Successfully updated ${email} to admin role`);
  console.log(`User ID: ${updatedUser.id}`);
  console.log(`Role: ${updatedUser.role}`);
}

makeAdmin().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});




