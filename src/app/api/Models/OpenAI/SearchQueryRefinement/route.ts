import { OpenAI } from "openai";
import { NextRequest } from "next/server";

// Create OpenAI client with error handling
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not configured in environment variables");
}

export const runtime = "edge";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, model, response_format, temperature, max_tokens } =
      await req.json();

    console.log("Search Query Refinement Through OpenAI API Route Started");

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create(
      {
        model: model,
        messages: messages,
        response_format: response_format,
        stream: false,
        temperature: temperature,
        max_tokens: max_tokens,
      },
      {
        signal: AbortSignal.timeout(30000),
      }
    );

    const refinedSearchParameters = response.choices[0].message.content;

    return new Response(refinedSearchParameters);
  } catch (error: any) {
    console.error(
      "Search Query Refinement Through OpenAI API Route Error:",
      error
    );
    return new Response(error.message || "An error occurred", {
      status: error.status || 500,
    });
  }
}
