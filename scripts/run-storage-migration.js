/**
 * Script to run the storage buckets migration using Supabase client
 * This uses the service role key to execute SQL directly
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function runMigration() {
  console.log("Running storage buckets migration...\n");
  
  // Read the SQL file
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "005_create_storage_buckets.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  
  // Split by semicolons to execute statements one by one
  // But we need to be careful with CREATE POLICY statements that might have semicolons inside
  const statements = sql
    .split(/;\s*(?=CREATE|INSERT|DROP)/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));
  
  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.trim().length === 0) continue;
    
    // Add semicolon back if not present
    const fullStatement = statement.endsWith(";") ? statement : statement + ";";
    
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      const { data, error } = await supabase.rpc("exec_sql", { sql_query: fullStatement });
      
      if (error) {
        // Try direct query execution
        const { error: queryError } = await supabase.from("_temp").select("*").limit(0);
        
        // If that doesn't work, try using the REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey,
          },
          body: JSON.stringify({ sql_query: fullStatement }),
        });
        
        if (!response.ok) {
          // Last resort: use PostgREST to execute via a custom function
          // Or we can use the management API
          console.log(`⚠ Statement ${i + 1} might need manual execution`);
          console.log(`SQL: ${fullStatement.substring(0, 100)}...`);
        }
      }
    } catch (err) {
      console.error(`Error executing statement ${i + 1}:`, err.message);
    }
  }
  
  console.log("\n✓ Migration completed!");
  console.log("\nNote: If some statements failed, you may need to run the SQL manually in the Supabase SQL editor.");
}

// Actually, Supabase JS client doesn't support executing arbitrary SQL
// We need to use psql or the Supabase Management API
// Let's use a simpler approach: output instructions

async function main() {
  console.log("⚠ Supabase JS client cannot execute arbitrary SQL directly.");
  console.log("Please run this migration using one of these methods:\n");
  console.log("1. Supabase Dashboard:");
  console.log("   - Go to: https://supabase.com/dashboard/project/tmhetngbdqklqddueugo/sql/new");
  console.log("   - Copy and paste the contents of: supabase/migrations/005_create_storage_buckets.sql");
  console.log("   - Click 'Run'\n");
  console.log("2. Using psql (if you have the database connection string):");
  console.log("   psql <connection_string> -f supabase/migrations/005_create_storage_buckets.sql\n");
  console.log("3. Using Supabase CLI (after logging in):");
  console.log("   supabase db push\n");
  
  // But let's try to at least check if buckets exist
  console.log("\nChecking existing buckets...\n");
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("Error listing buckets:", error.message);
    process.exit(1);
  }
  
  const bucketNames = buckets.map(b => b.id);
  const requiredBuckets = ["course-media", "course-videos"];
  
  console.log("Existing buckets:", bucketNames.length > 0 ? bucketNames.join(", ") : "none");
  
  const missingBuckets = requiredBuckets.filter(b => !bucketNames.includes(b));
  
  if (missingBuckets.length === 0) {
    console.log("\n✓ All required buckets already exist!");
  } else {
    console.log("\n✗ Missing buckets:", missingBuckets.join(", "));
    console.log("\nPlease run the migration SQL to create them.");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

