import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let storageClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseStorageClient() {
  if (storageClient) {
    return storageClient;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  storageClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return storageClient;
}

export async function uploadFile(
  file: File,
  path: string,
  bucket: string = "course-media"
): Promise<{ url: string; path: string }> {
  const client = getSupabaseStorageClient();

  // Convert file to array buffer
  const arrayBuffer = await file.arrayBuffer();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await client.storage
    .from(bucket)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = client.storage.from(bucket).getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

export async function deleteFile(path: string, bucket: string = "course-media"): Promise<void> {
  const client = getSupabaseStorageClient();

  const { error } = await client.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function getFileUrl(path: string, bucket: string = "course-media"): Promise<string> {
  const client = getSupabaseStorageClient();

  const { data } = client.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

