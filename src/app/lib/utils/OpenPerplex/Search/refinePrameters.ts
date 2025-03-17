import { conversationHistory } from "@/app/lib/utils/Chat/prompt&type";
import {
  OpenPerplexSearchQueryRefinementPrompt,
  OpenPerplexSearchParameters,
  OpenPerplexSearchParametersSchemaForOpenAI,
} from "./prompt&type";

export const fallbackSearchParametersForOpenPerplex = {
  query: "",
  date_context: "",
  location: "in",
  model: "gpt-4o-mini",
  response_language: "en",
  answer_type: "text",
  search_type: "general",
  return_citations: true,
  return_sources: true,
  return_images: false,
  recency_filter: "last 24 hours",
} as OpenPerplexSearchParameters;

export const refineParametersForOpenPerplexSearch = async (
  userQuery: string,
  conversationHistory: conversationHistory[],
  model: string,
  modelProvider: string
): Promise<
  OpenPerplexSearchParameters | "modelProvider not supported for refinement"
> => {
  console.log("Refining parameters for OpenPerplex Search");
  const refimentmessages = [
    OpenPerplexSearchQueryRefinementPrompt,
    {
      role: "user",
      content: `Consider the chat history for context: ${JSON.stringify(
        conversationHistory
      )} and the user query: ${userQuery}`,
    },
  ];

  if (modelProvider === "OpenAI") {
    console.log("Starting OpenAI API call for Search Query Refinement");
    try {
      //non-streaming response
      const response = await fetch("/api/Models/OpenAI/SearchQueryRefinement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: refimentmessages,
          model: model,
          response_format: {
            type: "json_schema",
            json_schema: OpenPerplexSearchParametersSchemaForOpenAI,
          },
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.error(
          "Query Refinement using OpenAI API - Failed",
          response.statusText
        );
        throw new Error(
          `Failed to get response from Search Query Refinement: ${response.statusText}`
        );
      }

      const data = await response.json();

      console.log("OpenAI API call for Search Query Refinement success");

      //example of data is  {
      //   "query": "How long does each thiti last in hours, starting from amavasya to pournima?",
      //   "date_context": "2025-03-13",
      //   "location": "in",
      //   "model": "gpt-4o-mini",
      //   "response_language": "auto",
      //   "answer_type": "text",
      //   "search_type": "general",
      //   "return_citations": true,
      //   "return_sources": true,
      //   "return_images": false,
      //   "recency_filter": "anytime"
      // }

      return data as OpenPerplexSearchParameters;
    } catch (error: any) {
      console.error("Error in UserQueryRefinementForOpenPerplexSearch:", error);
      throw error;
    }
  }
  return "modelProvider not supported for refinement";
};
