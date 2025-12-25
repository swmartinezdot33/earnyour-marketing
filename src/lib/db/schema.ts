// Database schema types for Supabase tables

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "student";
  ghl_contact_id: string | null;
  ghl_location_id: string | null;
  whitelabel_id: string | null;
  status: "active" | "suspended" | "deleted";
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  image_url: string | null;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content_type: "video" | "text" | "quiz" | "download";
  order: number;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface LessonContent {
  id: string;
  lesson_id: string;
  content: string; // JSON string for rich content
  video_url: string | null;
  video_provider: "youtube" | "vimeo" | "mux" | "custom" | null;
  quiz_data: string | null; // JSON string for quiz questions
  download_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  stripe_purchase_id: string | null;
  ghl_synced_at: string | null;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  progress_percentage: number;
  last_position: number | null; // For video playback position
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  certificate_url: string;
}

export interface StripeProduct {
  id: string;
  course_id: string;
  stripe_product_id: string;
  stripe_price_id: string;
  created_at: string;
}

export interface StripePurchase {
  id: string;
  user_id: string;
  course_id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

export interface GHLAutomation {
  id: string;
  enrollment_id: string;
  contact_id: string;
  automation_id: string;
  automation_name: string | null;
  triggered_at: string;
  status: "pending" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
}

export interface GHLPipeline {
  id: string;
  course_id: string;
  pipeline_id: string;
  pipeline_name: string;
  default_stage_id: string | null;
  default_stage_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface GHLSyncLog {
  id: string;
  user_id: string;
  enrollment_id: string | null;
  action: string;
  status: "success" | "failed" | "pending";
  error_message: string | null;
  ghl_response: string | null;
  created_at: string;
}

export interface WhitelabelAccount {
  id: string;
  owner_id: string;
  name: string;
  ghl_location_id: string;
  ghl_api_token: string;
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  status: "active" | "suspended" | "pending";
  created_at: string;
  updated_at: string;
}

export interface WhitelabelUserAssignment {
  id: string;
  user_id: string;
  whitelabel_id: string;
  assigned_at: string;
}

