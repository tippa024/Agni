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

    console.log("===SearchRefinimentThroughOPENAIAPISTARTING===");

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    // Before OpenAI call
    console.log("=== OpenAI Refinement Request ===");
    console.log("Input Messages:", messages);

    const response = await openai.chat.completions.create(
      {
        model: model,
        messages,
        response_format: response_format,
        stream: false,
        temperature: temperature,
        max_tokens: max_tokens,
      },
      {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    // Get the OpenAI response
    const refinedSearchParameters = response.choices[0].message.content;

    // After getting OpenAI response
    console.log("=== OpenAI Raw Response ===");
    console.log("Refined Search Parameters:", refinedSearchParameters);

    // Return it directly
    return new Response(refinedSearchParameters, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error.message || "An error occurred", {
      status: error.status || 500,
    });
  }
}
