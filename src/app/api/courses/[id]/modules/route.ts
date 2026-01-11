import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("modules")
      .select("id, title, description, order")
      .eq("course_id", id)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching modules:", error);
      return Response.json(
        { error: "Failed to fetch modules" },
        { status: 500 }
      );
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("Error in modules API:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
