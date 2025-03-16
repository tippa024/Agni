import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "edge";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log("ANTHROPIC STARTING");

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("Anthropic API key is not set", { status: 500 });
  }

  try {
    const { messages, model, systemMessage } = await req.json();
    console.log(" Anthropic API route Starting");

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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.delta?.text || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    console.log("Anthropic API route: returning stream");

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
