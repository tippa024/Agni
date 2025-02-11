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
    const { messages } = await req.json();

    console.log("===SearchRefinimentThroughOPENAIAPISTARTING===", messages);

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    // Before OpenAI call
    console.log("=== OpenAI Refinement Request ===");
    console.log("Input Messages:", messages);

    const response = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages,
        response_format: {
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
                  description:
                    "Optional date for context. example (Today is Monday 10 of February 2025 and the time is 12:43 PM)",
                },
                location: {
                  type: "string",
                  description:
                    "Country code for search context. This helps in providing localized results.(us, in, fr, es, de, it, etc.)",
                },
                pro_mode: {
                  type: "boolean",
                  description:
                    "Enable or disable pro mode for more advanced search capabilities.",
                },
                response_language: {
                  type: "string",
                  description:
                    "Language code for the response. 'auto' will auto-detect based on the query, en otherwise)",
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
                  description: "Return sources, yes by default.",
                },
                return_images: {
                  type: "boolean",
                  description:
                    "Return images if provided in the response (depends on the search query).",
                },
                recency_filter: {
                  type: "string",
                  description:
                    "Can be Last hour, Last 24 hours , Last week, Last month, Last year, Anytime. Please pick the most relevant option based on the query.",
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
        },
        stream: false,
        temperature: 0.2,
        max_tokens: 1000,
      },
      {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    // Get the OpenAI response
    const generatedText = response.choices[0].message.content;

    // After getting OpenAI response
    console.log("=== OpenAI Raw Response ===");
    console.log("Generated Text:", generatedText);

    // Return it directly
    return new Response(generatedText, {
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
