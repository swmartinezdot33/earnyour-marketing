import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateJSONWithAI, generateWithAI } from "@/lib/ai/client";
import {
  generateCourseStructurePrompt,
  generateCourseMetadataPrompt,
  generateModuleOutlinePrompt,
  generateModuleDescriptionPrompt,
  generateLessonDescriptionPrompt,
  generateContentPrompt,
  CourseStructure,
} from "@/lib/ai/prompts";

// Generate full course structure
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, ...params } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Type is required" },
        { status: 400 }
      );
    }

    switch (type) {
      case "structure": {
        const { topic, targetAudience, courseLevel, duration } = params;
        
        if (!topic) {
          return NextResponse.json(
            { success: false, error: "Topic is required" },
            { status: 400 }
          );
        }

        const prompt = generateCourseStructurePrompt(topic, {
          targetAudience,
          courseLevel,
          duration,
        });

        const structure = await generateJSONWithAI<CourseStructure>(prompt, {
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 3000,
        });

        return NextResponse.json({ success: true, data: structure });
      }

      case "metadata": {
        const { topic, targetAudience, courseLevel } = params;
        
        if (!topic) {
          return NextResponse.json(
            { success: false, error: "Topic is required" },
            { status: 400 }
          );
        }

        const prompt = generateCourseMetadataPrompt(topic, {
          targetAudience,
          courseLevel,
        });

        const metadata = await generateJSONWithAI<{
          title: string;
          short_description: string;
          description: string;
        }>(prompt, {
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 1000,
        });

        return NextResponse.json({ success: true, data: metadata });
      }

      case "module-outline": {
        const { moduleTitle, courseTopic, moduleDescription } = params;
        
        if (!moduleTitle || !courseTopic) {
          return NextResponse.json(
            { success: false, error: "Module title and course topic are required" },
            { status: 400 }
          );
        }

        const prompt = generateModuleOutlinePrompt(moduleTitle, courseTopic, moduleDescription);

        const outline = await generateJSONWithAI<{
          lessons: Array<{
            title: string;
            description: string;
            content_type: "video" | "text" | "quiz" | "download";
          }>;
        }>(prompt, {
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 1500,
        });

        return NextResponse.json({ success: true, data: outline });
      }

      case "module-description": {
        const { moduleTitle, courseTopic, lessonTitles } = params;
        
        if (!moduleTitle || !courseTopic) {
          return NextResponse.json(
            { success: false, error: "Module title and course topic are required" },
            { status: 400 }
          );
        }

        const prompt = generateModuleDescriptionPrompt(
          moduleTitle,
          courseTopic,
          lessonTitles || []
        );

        const description = await generateWithAI(prompt, {
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 300,
        });

        return NextResponse.json({ success: true, data: { description: description.trim() } });
      }

      case "lesson-description": {
        const { lessonTitle, moduleTitle, courseTopic } = params;
        
        if (!lessonTitle || !moduleTitle || !courseTopic) {
          return NextResponse.json(
            { success: false, error: "Lesson title, module title, and course topic are required" },
            { status: 400 }
          );
        }

        const prompt = generateLessonDescriptionPrompt(lessonTitle, moduleTitle, courseTopic);

        const description = await generateWithAI(prompt, {
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 200,
        });

        return NextResponse.json({ success: true, data: { description: description.trim() } });
      }

      case "content": {
        const { field, topic, currentValue, targetAudience } = params;
        
        if (!field || !["title", "short_description", "description"].includes(field)) {
          return NextResponse.json(
            { success: false, error: "Valid field is required (title, short_description, description)" },
            { status: 400 }
          );
        }

        const prompt = generateContentPrompt(field, {
          topic,
          currentValue,
          targetAudience,
        });

        const content = await generateWithAI(prompt, {
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: field === "title" ? 100 : field === "short_description" ? 200 : 500,
        });

        return NextResponse.json({ success: true, data: { content: content.trim() } });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI generation error:", error);
    
    // Provide more helpful error messages
    let errorMessage = "Failed to generate content";
    
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        errorMessage = "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.";
      } else if (error.message.includes("No content generated")) {
        errorMessage = "OpenAI did not return any content. Please try again.";
      } else if (error.message.includes("Failed to parse JSON")) {
        errorMessage = "OpenAI returned invalid JSON. Please try again.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    );
  }
}


