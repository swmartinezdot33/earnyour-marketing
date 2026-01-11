/**
 * Image optimization utilities
 * For production, consider using a service like Cloudinary, ImageKit, or Next.js Image Optimization
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

/**
 * Generate thumbnail URL from Supabase Storage URL
 * This is a placeholder - in production, use a proper image optimization service
 */
export function getThumbnailUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width = 300, height, quality = 80, format = "webp" } = options;

  // If using Supabase Storage, we can use their image transformation API
  // For now, return the original URL
  // In production, integrate with Cloudinary, ImageKit, or similar service
  
  if (originalUrl.includes("supabase.co")) {
    // Supabase Storage supports image transformations via URL parameters
    const url = new URL(originalUrl);
    url.searchParams.set("width", width.toString());
    if (height) url.searchParams.set("height", height.toString());
    url.searchParams.set("quality", quality.toString());
    return url.toString();
  }

  // For other URLs, return as-is (or use a CDN transformation service)
  return originalUrl;
}

/**
 * Generate multiple thumbnail sizes
 */
export function getThumbnailSizes(originalUrl: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
} {
  return {
    thumbnail: getThumbnailUrl(originalUrl, { width: 150, height: 150 }),
    small: getThumbnailUrl(originalUrl, { width: 300, height: 300 }),
    medium: getThumbnailUrl(originalUrl, { width: 600, height: 600 }),
    large: getThumbnailUrl(originalUrl, { width: 1200, height: 1200 }),
  };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;

      if (minWidth && width < minWidth) {
        resolve({ valid: false, error: `Image width must be at least ${minWidth}px` });
        return;
      }

      if (minHeight && height < minHeight) {
        resolve({ valid: false, error: `Image height must be at least ${minHeight}px` });
        return;
      }

      if (maxWidth && width > maxWidth) {
        resolve({ valid: false, error: `Image width must be at most ${maxWidth}px` });
        return;
      }

      if (maxHeight && height > maxHeight) {
        resolve({ valid: false, error: `Image height must be at most ${maxHeight}px` });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: "Invalid image file" });
    };

    img.src = url;
  });
}

/**
 * Compress image client-side before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}




