import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export const dynamic = "force-dynamic";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request body structure:", Object.keys(body));

    const { messages, model } = body;

    if (!messages) {
      console.error("Missing messages in request body");
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    if (!model) {
      console.error("Missing model in request body");
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: model,
      messages: messages,
      max_tokens: 1024,
      temperature: 1,
    });

    // Fix the type error by checking the content type
    const content = response.content[0];

    const markdown = "type" in content ? content.text : "";

    console.log("Markdown from Anthropic API received", markdown);

    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error("Anthropic Conversation to Markdown API Error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Anthropic Conversation to Markdown API Error",
        details: error.message,
        path: req.nextUrl.pathname,
      },
      { status: 500 }
    );
  }
}
