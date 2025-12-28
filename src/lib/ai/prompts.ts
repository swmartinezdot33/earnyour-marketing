/**
 * Prompt templates for AI course generation
 */

export interface CourseStructure {
  title: string;
  short_description: string;
  description: string;
  modules: Array<{
    title: string;
    description: string;
    lessons: Array<{
      title: string;
      description: string;
      content_type: "video" | "text" | "quiz" | "download";
    }>;
  }>;
}

export function generateCourseStructurePrompt(
  topic: string,
  options?: {
    targetAudience?: string;
    courseLevel?: "beginner" | "intermediate" | "advanced";
    duration?: string;
  }
): string {
  const { targetAudience, courseLevel, duration } = options || {};

  return `Create a comprehensive course structure for the following topic: "${topic}"

${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${courseLevel ? `Course Level: ${courseLevel}` : ""}
${duration ? `Suggested Duration: ${duration}` : ""}

Generate a complete course structure with:
1. A compelling course title
2. A short description (1-2 sentences for marketing)
3. A detailed description (2-3 paragraphs explaining what students will learn)
4. 4-8 modules that logically break down the topic
5. Each module should have 3-8 lessons
6. Each lesson should have a title, description, and appropriate content type (video, text, quiz, or download)

Return the response as JSON in this exact format:
{
  "title": "Course Title Here",
  "short_description": "Brief one-liner description",
  "description": "Detailed multi-paragraph description",
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description explaining what will be covered",
      "lessons": [
        {
          "title": "Lesson Title",
          "description": "What students will learn in this lesson",
          "content_type": "video"
        }
      ]
    }
  ]
}

Ensure the course structure is:
- Well-organized and logical
- Progressive (builds from basics to advanced)
- Practical and actionable
- Engaging and valuable

Generate the course structure now:`;
}

export function generateCourseMetadataPrompt(
  topic: string,
  options?: {
    targetAudience?: string;
    courseLevel?: string;
  }
): string {
  const { targetAudience, courseLevel } = options || {};

  return `Generate course metadata for a course about: "${topic}"

${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${courseLevel ? `Course Level: ${courseLevel}` : ""}

Generate:
1. A compelling, SEO-friendly course title (max 60 characters)
2. A short description (1-2 sentences, max 160 characters) - for marketing and previews
3. A detailed description (2-3 paragraphs) - explaining what students will learn, benefits, and outcomes

Return as JSON:
{
  "title": "Course Title",
  "short_description": "Brief description",
  "description": "Detailed description"
}`;
}

export function generateModuleOutlinePrompt(
  moduleTitle: string,
  courseTopic: string,
  moduleDescription?: string
): string {
  return `Create a detailed module outline for a course module titled "${moduleTitle}" in a course about "${courseTopic}".

${moduleDescription ? `Module Context: ${moduleDescription}` : ""}

Generate 3-8 lessons that logically progress through the module topic. For each lesson, provide:
1. A clear, descriptive title
2. A brief description of what will be covered
3. The most appropriate content type (video, text, quiz, or download)

Return as JSON:
{
  "lessons": [
    {
      "title": "Lesson Title",
      "description": "Lesson description",
      "content_type": "video"
    }
  ]
}`;
}

export function generateModuleDescriptionPrompt(
  moduleTitle: string,
  courseTopic: string,
  lessonTitles: string[]
): string {
  return `Generate a compelling module description for "${moduleTitle}" in a course about "${courseTopic}".

This module will cover:
${lessonTitles.map((title, i) => `${i + 1}. ${title}`).join("\n")}

Create a 2-3 sentence description that:
- Explains the overall purpose of the module
- Highlights what students will learn
- Connects the lessons together logically

Return only the description text (no JSON, no quotes, just the description).`;
}

export function generateLessonDescriptionPrompt(
  lessonTitle: string,
  moduleTitle: string,
  courseTopic: string
): string {
  return `Generate a brief description (1-2 sentences) for a lesson titled "${lessonTitle}" in the module "${moduleTitle}" for a course about "${courseTopic}".

The description should:
- Clearly explain what students will learn
- Be concise and engaging
- Focus on learning outcomes

Return only the description text (no JSON, no quotes, just the description).`;
}

export function generateContentPrompt(
  field: "title" | "short_description" | "description",
  context: {
    topic?: string;
    currentValue?: string;
    targetAudience?: string;
  }
): string {
  const { topic, currentValue, targetAudience } = context;

  let prompt = `Generate a ${field === "short_description" ? "short (1-2 sentence)" : field === "description" ? "detailed (2-3 paragraph)" : ""} ${field} for `;

  if (topic) {
    prompt += `a course about "${topic}".`;
  } else {
    prompt += `this course.`;
  }

  if (targetAudience) {
    prompt += ` Target audience: ${targetAudience}.`;
  }

  if (currentValue) {
    prompt += ` Current value: "${currentValue}". Please improve or regenerate this.`;
  }

  if (field === "title") {
    prompt += " Make it compelling, SEO-friendly, and under 60 characters.";
  } else if (field === "short_description") {
    prompt += " Make it engaging and suitable for marketing/previews (max 160 characters).";
  } else {
    prompt += " Focus on what students will learn, benefits, and outcomes.";
  }

  prompt += " Return only the generated text (no JSON, no quotes, just the text).";

  return prompt;
}


