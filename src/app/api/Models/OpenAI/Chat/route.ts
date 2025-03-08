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
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OpenAI API key is not set", { status: 500 });
  }

  try {
    const { messages, model } = await req.json();
    console.log("===ChatOpenAIAPIStarting===");

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages,
      stream: true,
      response_format: { type: "text" },
      temperature: 1,
      max_tokens: 1000,
    });

    // Create a TransformStream to handle the streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(text));
          console.log("OpenAI API Chunk:", text);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error.message || "An error occurred", {
      status: error.status || 500,
    });
  }
}
