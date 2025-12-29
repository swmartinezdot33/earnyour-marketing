/**
 * Execute SQL using Supabase Management API
 * Requires SUPABASE_ACCESS_TOKEN or you can get it from: https://supabase.com/dashboard/account/tokens
 */

const fs = require("fs");
const path = require("path");

const projectRef = "tmhetngbdqklqddueugo";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error("Error: SUPABASE_ACCESS_TOKEN environment variable is required");
  console.error("\nTo get your access token:");
  console.error("1. Go to: https://supabase.com/dashboard/account/tokens");
  console.error("2. Create a new token");
  console.error("3. Set it as: export SUPABASE_ACCESS_TOKEN=your_token_here");
  console.error("\nOr run this script with: SUPABASE_ACCESS_TOKEN=your_token node scripts/execute-sql-cli.js");
  process.exit(1);
}

async function executeSQL(sql) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: sql,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

async function main() {
  console.log("Executing storage buckets migration...\n");
  
  // Read the SQL file
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "005_create_storage_buckets.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  
  try {
    console.log("Sending SQL to Supabase Management API...");
    const result = await executeSQL(sql);
    console.log("\n✓ Migration executed successfully!");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n✗ Error executing migration:", error.message);
    console.error("\nAlternative: Run the SQL manually in the Supabase SQL editor:");
    console.error("https://supabase.com/dashboard/project/tmhetngbdqklqddueugo/sql/new");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

