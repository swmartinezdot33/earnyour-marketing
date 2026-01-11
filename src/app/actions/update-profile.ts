"use server";

import { getSession } from "@/lib/auth";
import { updateUser, getUserByEmail } from "@/lib/db/users";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
});

type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  
  if (!session) {
    return {
      success: false,
      message: "You must be logged in to update your profile",
    };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
  };

  const validatedFields = updateProfileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const data = validatedFields.data;
  const updates: { name?: string; email?: string } = {};

  try {
    // Update name if provided
    if (data.name !== undefined && data.name.trim() !== "") {
      updates.name = data.name.trim();
    }

    // Update email if provided and different from current
    if (data.email !== undefined && data.email.toLowerCase() !== session.email.toLowerCase()) {
      const emailLower = data.email.toLowerCase().trim();
      
      // Check if email is already taken by another user
      const existingUser = await getUserByEmail(emailLower);
      if (existingUser && existingUser.id !== session.userId) {
        return {
          success: false,
          errors: {
            email: ["This email is already in use by another account"],
          },
          message: "Email is already taken",
        };
      }

      updates.email = emailLower;
    }

    // Update user in database
    if (Object.keys(updates).length > 0) {
      await updateUser(session.userId, updates);
      revalidatePath("/dashboard/settings");
      
      return {
        success: true,
        message: updates.email
          ? "Profile updated! Please use your new email address for future logins."
          : "Profile updated successfully!",
      };
    }

    return {
      success: true,
      message: "No changes to save",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
