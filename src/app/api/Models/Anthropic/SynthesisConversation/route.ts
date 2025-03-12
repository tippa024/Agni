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
      tools: [
        {
          name: "SynthesizeConversationToMarkDown",
          description: "Synthesize a conversation to markdown",
          input_schema: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description:
                  "A descriptive filename for the markdown document (without extension)",
              },
              content: {
                type: "string",
                description: "The formatted markdown content",
              },
            },
            required: ["filename", "content"],
          },
        },
      ],
    });

    console.log("Synthesis Conversation API Response", response);

    // Extract the tool_use content from the response
    const toolUseContent = response.content.find(
      (item) => item.type === "tool_use"
    ) as
      | { type: string; input: { content: string; filename: string } }
      | undefined;

    // Get the markdown content from the tool_use input
    const markdown = toolUseContent?.input?.content || "";
    const filename = toolUseContent?.input?.filename || "";

    console.log("Markdown from Anthropic API received", markdown);
    console.log("Filename from Anthropic API received", filename);

    return NextResponse.json({ markdown, filename });
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
