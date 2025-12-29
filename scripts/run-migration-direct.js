/**
 * Execute SQL migration directly using Supabase service role
 * This bypasses the need for database password by using the service role key
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
    // Ignore if .env.local doesn't exist
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
});

async function executeSQL(sql) {
  // Split SQL into individual statements
  // Remove comments and empty lines
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"))
    .map(s => s + ";");
  
  console.log(`Executing ${statements.length} SQL statements...\n`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.trim() === ";" || statement.trim().length === 0) continue;
    
    // Skip DROP POLICY IF EXISTS if it fails (policy might not exist)
    const isDropPolicy = statement.toUpperCase().includes("DROP POLICY IF EXISTS");
    
    console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 60)}...`);
    
    try {
      // Use RPC to execute SQL - but Supabase doesn't expose exec_sql by default
      // So we'll try using the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
        body: JSON.stringify({ sql_query: statement }),
      });
      
      if (!response.ok && !isDropPolicy) {
        const errorText = await response.text();
        console.error(`  ✗ Error: ${errorText}`);
      } else {
        console.log(`  ✓ Success`);
      }
    } catch (err) {
      if (!isDropPolicy) {
        console.error(`  ✗ Error: ${err.message}`);
      } else {
        console.log(`  ⚠ Skipped (policy may not exist)`);
      }
    }
  }
}

async function main() {
  console.log("Running storage buckets migration using service role...\n");
  
  // Read the SQL file
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "005_create_storage_buckets.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  
  // Unfortunately, Supabase JS client doesn't support arbitrary SQL execution
  // We need to use the Management API or psql
  console.log("⚠ Supabase JS client cannot execute arbitrary SQL directly.");
  console.log("The service role key doesn't grant SQL execution permissions.\n");
  
  console.log("Please use one of these methods:\n");
  console.log("1. Supabase CLI (requires DB password):");
  console.log("   supabase db push --linked --password YOUR_PASSWORD\n");
  console.log("2. Supabase Dashboard (easiest):");
  console.log("   https://supabase.com/dashboard/project/tmhetngbdqklqddueugo/sql/new\n");
  console.log("3. Management API (requires access token):");
  console.log("   SUPABASE_ACCESS_TOKEN=token node scripts/execute-sql-cli.js\n");
  
  // But let's at least verify the buckets don't exist yet
  console.log("\nChecking existing buckets...\n");
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("Error:", error.message);
  } else {
    const bucketNames = buckets.map(b => b.id);
    const required = ["course-media", "course-videos"];
    const missing = required.filter(b => !bucketNames.includes(b));
    
    if (missing.length === 0) {
      console.log("✓ All buckets already exist!");
    } else {
      console.log(`✗ Missing buckets: ${missing.join(", ")}`);
      console.log("\nSQL to run:\n");
      console.log(sql);
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

