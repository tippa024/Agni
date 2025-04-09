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
  console.log(
    "Synthesis Conversation to Markdown using Anthropic API route starting"
  );

  try {
    const body = await req.json();

    const { messages, model, systemMessage } = body;

    console.log("Anthropic API route request body", body);

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
      system: systemMessage,
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
                  "A descriptive yet concise filename (adhering to markdown file naming conventions) for the markdown document (without extension)",
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

    console.log(
      "Synthesis Conversation to Markdown using Anthropic API route response received",
      response
    );

    const toolUseContent = response.content.find(
      (item) => item.type === "tool_use"
    );

    const textContent = response.content.find((item) => item.type === "text");

    let markdown = "";
    let filename = "";
    let AnthropicResponse = { text: "" };

    if (toolUseContent && "input" in toolUseContent) {
      markdown = (toolUseContent.input as any).content || "";
      filename = (toolUseContent.input as any).filename || "";
    } else {
      console.log("Tool use content not found or has unexpected structure");
    }

    if (textContent && "text" in textContent) {
      AnthropicResponse = { text: textContent.text };
    } else {
      console.log("Text content not found or has unexpected structure");
    }

    console.log("Markdown from Anthropic API", markdown);
    console.log("Filename from Anthropic API", filename);
    console.log("Anthropic Text Response", AnthropicResponse.text);

    console.log(
      "Synthesis Conversation to Markdown using Anthropic API route completed"
    );

    return NextResponse.json({
      text: AnthropicResponse.text,
      markdown,
      filename,
    });
  } catch (error: any) {
    console.error(
      "Synthesis Conversation to Markdown using Anthropic API route Error:",
      error
    );
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error:
          "Synthesis Conversation to Markdown using Anthropic API route Error",
        details: error.message,
        path: req.nextUrl.pathname,
      },
      { status: 500 }
    );
  }
}
