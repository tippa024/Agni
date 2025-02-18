import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "edge";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log("ANTHROPIC STARTING");

export async function POST(req: NextRequest) {
  try {
    const { messages, model, systemMessage } = await req.json();
    console.log(" Anthropic API Starting with messages", messages);

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    const response = anthropic.messages.stream({
      model: model,
      system: systemMessage,
      messages: messages,
      max_tokens: 1024,
      temperature: 1,
      stream: true,
    });

    // Create a TransformStream to handle the streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.delta?.text || "";
          controller.enqueue(encoder.encode(text));
          console.log("Anthropic Chunk", text);
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
    console.error("Anthropic Chat API Error:", error);
    return new Response(error.message || "An error occurred", {
      status: error.status || 500,
    });
  }
}
