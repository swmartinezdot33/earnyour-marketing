import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/storage/supabase";
import { getThumbnailSizes } from "@/lib/storage/image-optimization";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const lessonId = formData.get("lessonId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    let allowedTypes: string[] = [];
    let bucket = "course-media";
    let path = "general";

    switch (type) {
      case "image":
        allowedTypes = ALLOWED_IMAGE_TYPES;
        path = "images";
        break;
      case "video":
        allowedTypes = ALLOWED_VIDEO_TYPES;
        path = "videos";
        bucket = "course-videos"; // Separate bucket for videos
        break;
      case "document":
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
        path = "documents";
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid file type" },
          { status: 400 }
        );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} is not allowed for ${type} uploads` },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    try {
      const uploadPath = lessonId ? `${path}/${lessonId}` : path;
      const { url, path: filePath } = await uploadFile(file, uploadPath, bucket);

      // Generate thumbnails for images
      let thumbnails = null;
      if (type === "image") {
        thumbnails = getThumbnailSizes(url);
      }

      return NextResponse.json({
        success: true,
        url,
        path: filePath,
        thumbnails,
        message: "File uploaded successfully",
      });
    } catch (storageError) {
      console.error("Storage upload error:", storageError);
      
      // Fallback to base64 if Supabase Storage is not configured
      if (storageError instanceof Error && storageError.message.includes("Supabase credentials")) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const mimeType = file.type;
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return NextResponse.json({
          success: true,
          url: dataUrl,
          message: "File uploaded as base64. Configure Supabase Storage for production use.",
        });
      }

      throw storageError;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}


