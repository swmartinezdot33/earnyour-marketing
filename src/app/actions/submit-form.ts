"use server";

import fs from "fs";
import path from "path";
import { z } from "zod";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  website: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  city: z.string().min(1, "City is required"),
  monthlySpend: z.string().optional(),
  goal: z.string().min(1, "Primary goal is required"),
  smsConsent: z.string().optional(), // "on" when checked, undefined when not checked
});

type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitAuditForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = {
    name: formData.get("name"),
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    city: formData.get("city"),
    monthlySpend: formData.get("monthlySpend"),
    goal: formData.get("goal"),
    smsConsent: formData.get("smsConsent"),
  };

  const validatedFields = formSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const data = validatedFields.data;
  const smsConsentGiven = data.smsConsent === "on";
  const consentTimestamp = smsConsentGiven ? new Date().toISOString() : null;

  // Remove raw smsConsent from data (it's just "on" or undefined), we'll store boolean and timestamp
  const { smsConsent: _, ...formDataToStore } = data;

  try {
    // 1. Send to LeadConnector Webhook
    const webhookUrl = "https://services.leadconnectorhq.com/hooks/GQOh2EMzgc3bRAfN7Q9j/webhook-trigger/q4hPueFxoEAr0rWXtcsA";
    try {
      const webhookPayload = {
        name: data.name,
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        website: data.website || "",
        industry: data.industry,
        city: data.city,
        monthlySpend: data.monthlySpend || "",
        goal: data.goal,
        smsConsent: smsConsentGiven,
        smsConsentTimestamp: consentTimestamp,
        source: "Website Form",
        submittedAt: new Date().toISOString(),
      };

      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error("Webhook error:", webhookResponse.status, errorText);
        // Don't fail the form submission if webhook fails, but log it
      }
    } catch (webhookError) {
      console.error("Webhook request failed:", webhookError);
      // Don't fail the form submission if webhook fails, but log it
    }

    // 2. Send Email (Resend)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "EarnYour Website <onboarding@resend.dev>", // Update with verified domain
        to: process.env.CONTACT_TO_EMAIL || "hello@earnyour.com",
        subject: `New Audit Request: ${data.businessName}`,
        html: `
          <h1>New Free Audit Request</h1>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Business:</strong> ${data.businessName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Website:</strong> ${data.website || "N/A"}</p>
          <p><strong>Industry:</strong> ${data.industry}</p>
          <p><strong>City:</strong> ${data.city}</p>
          <p><strong>Spend:</strong> ${data.monthlySpend || "Not specified"}</p>
          <p><strong>Goal:</strong> ${data.goal}</p>
          <p><strong>SMS Consent:</strong> ${smsConsentGiven ? "Yes (at " + consentTimestamp + ")" : "No"}</p>
        `,
      });
    }

    // 3. Save Data
    if (process.env.NODE_ENV === "development") {
      // Local JSON
      const dbPath = path.join(process.cwd(), "data", "submissions.json");
      let submissions = [];
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, "utf8");
        try {
          submissions = JSON.parse(fileContent);
        } catch (e) {
          console.error("Error reading submissions.json", e);
        }
      }
      submissions.push({ 
        ...formDataToStore, 
        createdAt: new Date().toISOString(),
        smsConsent: smsConsentGiven,
        smsConsentTimestamp: consentTimestamp,
      });
      fs.writeFileSync(dbPath, JSON.stringify(submissions, null, 2));
    } else {
      // Supabase (Production)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Ensure table 'leads' exists in Supabase
        const { error } = await supabase.from("leads").insert([
          { 
            ...formDataToStore, 
            created_at: new Date().toISOString(),
            sms_consent: smsConsentGiven,
            sms_consent_timestamp: consentTimestamp,
          }
        ]);

        if (error) {
          console.error("Supabase error:", error);
          // Don't fail the request if DB save fails, but log it
        }
      }
    }

    return { success: true, message: "Application received! We'll be in touch shortly." };
  } catch (error) {
    console.error("Submission error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}









