import { QueryRefinementPrompt } from "../../utils/promt";
import { ChatState, ChatActions } from "../../utils/type";

// Define fallback search parameters as a constant
const FALLBACK_SEARCH_PARAMS = {
  query: "",
  date_context: "",
  location: "in",
  pro_mode: false,
  response_language: "en",
  answer_type: "text",
  search_type: "general",
  verbose_mode: false,
  return_citations: true,
  return_sources: true,
  return_images: false,
  recency_filter: "last 24 hours",
} as const;

export async function SearchQueryRefinement(
  userMessage: string,
  context: ChatState,
  actions: ChatActions
) {
  try {
    const response = await fetch("/api/OpenAI/SearchQueryRefinement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: ` ${
              QueryRefinementPrompt.content
            } Consider the chat history for context: ${JSON.stringify(
              context.conversationHistory
            )} `,
          },
          { role: "user", content: userMessage },
        ],
      }),
    });

    console.log("Query Refinement - Completed");

    actions.setCurrentProcessingStep("Completed Refining Search Query");

    if (!response.ok) {
      throw new Error(
        `Failed to get response from Search Query Refinement: ${response.statusText}`
      );
    }

    const refinedSearchData = await response.json();
    console.log("Refined Search Query & Parameters:", refinedSearchData);
    return refinedSearchData;
  } catch (error) {
    console.error("Search Query Refinement Error:", error);

    // Return fallback data with the current user message and timestamp
    const fallbackData = {
      ...FALLBACK_SEARCH_PARAMS,
      query: userMessage,
      date_context: `The current date is ${
        new Date().toISOString().split("T")[0]
      } and the current time is ${
        new Date().toISOString().split("T")[1].split(".")[0]
      }`,
    };
    console.log("Using fallback data:", fallbackData);
    return fallbackData;
  }
}
