import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (client) {
    return client;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  client = new OpenAI({
    apiKey,
  });

  return client;
}

export async function generateWithAI(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" } | { type: "text" };
  } = {}
): Promise<string> {
  const openai = getOpenAIClient();

  const {
    model = "gpt-4o-mini",
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat = { type: "text" },
  } = options;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are an expert course designer and educator. Create high-quality, structured educational content that is engaging and valuable for students.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: responseFormat,
  });

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content generated from OpenAI");
  }

  return content;
}

export async function generateJSONWithAI<T>(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<T> {
  const content = await generateWithAI(prompt, {
    ...options,
    responseFormat: { type: "json_object" },
  });

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
}


