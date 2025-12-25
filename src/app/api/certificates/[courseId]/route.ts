import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { getCourseBySlug } from "@/lib/db/courses";
import { generateCertificate } from "@/lib/certificates/generate";
import { getSupabaseClient } from "@/lib/db/courses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const user = await getUserById(session.userId);
    const supabase = getSupabaseClient();
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (!user || !courseData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", session.userId)
      .eq("course_id", courseId)
      .single();

    let certificateUrl = (existingCert as any)?.certificate_url;

    if (!certificateUrl) {
      // Generate certificate
      const pdfBuffer = await generateCertificate(user, courseData as any);
      
      // Upload to Supabase Storage or save to public folder
      // For now, we'll return the PDF directly
      // In production, upload to storage and save URL to database
      
      // Save certificate record
      const { data: cert } = await (supabase.from("certificates") as any)
        .insert([
          {
            user_id: session.userId,
            course_id: courseId,
            certificate_url: `/api/certificates/${courseId}/download`, // Temporary
          },
        ])
        .select()
        .single();

      certificateUrl = (cert as any)?.certificate_url;
    }

    // Return PDF
    const pdfBuffer = await generateCertificate(user, courseData as any);
    
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${(courseData as any).slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

