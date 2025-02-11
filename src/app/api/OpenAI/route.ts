import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
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
    const {
      messages,
      reasoningEnabled,
      currentProcessingStep = "",
      modelOutputFormat,
    } = await req.json();

    console.log("===OPENAIAPISTARTING===", messages);
    console.log("===Current Processing Step===", currentProcessingStep);

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create(
      {
        model:
          reasoningEnabled && currentProcessingStep !== "Refining Search Query"
            ? "o3-mini"
            : "gpt-4o-mini",
        messages,
        response_format:
          currentProcessingStep === "Refining Search Query"
            ? {
                type: "json_schema",
                json_schema: {
                  name: "search_parameters",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      query: {
                        type: "string",
                        description:
                          "The search query or question you want to ask. This is the primary input for your search. Be as specific as possible in your query.",
                      },
                      date_context: {
                        type: "string",
                        description: "Optional date for context.",
                      },
                      location: {
                        type: "string",
                        description:
                          "Country code for search context. This helps in providing localized results.",
                      },
                      pro_mode: {
                        type: "boolean",
                        description:
                          "Enable or disable pro mode for more advanced search capabilities.",
                      },
                      response_language: {
                        type: "string",
                        description:
                          "Language code for the response. 'auto' will auto-detect based on the query.",
                      },
                      answer_type: {
                        type: "string",
                        description:
                          "Format of the answer. Options: 'text', 'markdown', or 'html'.",
                      },
                      search_type: {
                        type: "string",
                        description: "Type of the search: general or news.",
                      },
                      verbose_mode: {
                        type: "boolean",
                        description:
                          "Set verbose_mode parameter to True to get more detailed information in the response.",
                      },
                      return_citations: {
                        type: "boolean",
                        description: "Include citations in the response.",
                      },
                      return_sources: {
                        type: "boolean",
                        description: "Return sources.",
                      },
                      return_images: {
                        type: "boolean",
                        description:
                          "Return images if provided in the response (depends on the search query and the google API).",
                      },
                      recency_filter: {
                        type: "string",
                        description:
                          "Can be hour, day, week, month, year, anytime. Impacts the search results recency.",
                      },
                    },
                    required: [
                      "query",
                      "date_context",
                      "location",
                      "pro_mode",
                      "response_language",
                      "answer_type",
                      "search_type",
                      "verbose_mode",
                      "return_citations",
                      "return_sources",
                      "return_images",
                      "recency_filter",
                    ],
                    additionalProperties: false,
                  },
                },
              }
            : undefined,
        stream:
          currentProcessingStep === "Refining Search Query" ? false : true,
        temperature:
          currentProcessingStep === "Refining Search Query" ? 0.2 : 0.7,
        max_tokens: 1000,
      },
      {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    // Convert to stream
    const stream = OpenAIStream(response);

    // Return streaming response
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error.message || "An error occurred", {
      status: error.status || 500,
    });
  }
}
