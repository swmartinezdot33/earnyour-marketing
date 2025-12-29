/**
 * Script to create Supabase Storage buckets if they don't exist
 * Run this with: node scripts/create-storage-buckets.js
 */

const { createClient } = require("@supabase/supabase-js");

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

async function createBucket(id, name, publicAccess, fileSizeLimit, allowedMimeTypes) {
  console.log(`\nCreating bucket: ${id}...`);
  
  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error(`Error listing buckets: ${listError.message}`);
    return false;
  }
  
  const bucketExists = buckets.some(b => b.id === id);
  
  if (bucketExists) {
    console.log(`✓ Bucket "${id}" already exists`);
    return true;
  }
  
  // Create bucket via SQL (Supabase JS doesn't have a direct createBucket method)
  // We'll use the REST API directly
  const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
    },
    body: JSON.stringify({
      id,
      name,
      public: publicAccess,
      file_size_limit: fileSizeLimit,
      allowed_mime_types: allowedMimeTypes,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error(`✗ Failed to create bucket "${id}": ${error}`);
    return false;
  }
  
  console.log(`✓ Successfully created bucket "${id}"`);
  return true;
}

async function setupStorageBuckets() {
  console.log("Setting up Supabase Storage buckets...\n");
  
  const buckets = [
    {
      id: "course-media",
      name: "course-media",
      public: true,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    },
    {
      id: "course-videos",
      name: "course-videos",
      public: true,
      fileSizeLimit: 524288000, // 500MB
      allowedMimeTypes: [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
      ],
    },
  ];
  
  let allSuccess = true;
  
  for (const bucket of buckets) {
    const success = await createBucket(
      bucket.id,
      bucket.name,
      bucket.public,
      bucket.fileSizeLimit,
      bucket.allowedMimeTypes
    );
    if (!success) {
      allSuccess = false;
    }
  }
  
  if (!allSuccess) {
    console.log("\n⚠ Some buckets failed to create. You may need to create them manually in the Supabase dashboard.");
    console.log("Go to: Storage > Buckets > New bucket");
    console.log("\nOr run the SQL migration in the Supabase SQL editor:");
    console.log("See: supabase/migrations/005_create_storage_buckets.sql");
    process.exit(1);
  }
  
  console.log("\n✓ All storage buckets are set up!");
  console.log("\nNote: You may still need to set up RLS policies manually.");
  console.log("See: supabase/migrations/005_create_storage_buckets.sql for the policies.");
}

setupStorageBuckets().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

