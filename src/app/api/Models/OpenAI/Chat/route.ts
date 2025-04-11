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

  console.log("OpenAI API route Starting");

  try {
    const { messages, model } = await req.json();

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

    const { readable, writable } = new TransformStream();
    const encoder = new TextEncoder();
    const writer = writable.getWriter();
    (async () => {
      try {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            const encoded = encoder.encode(text);
            await writer.write(encoded);
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
      } finally {
        await writer.close();
      }
    })();

    console.log("OpenAI API route: returning stream");

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error.message || "An error occurred", {
      status: error.status || 500,
    });
  }
}
