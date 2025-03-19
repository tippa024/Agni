import { conversationHistory } from "@/Mediums/Chat/Utils/prompt&type";
import {
  OpenPerplexSearchQueryRefinementPrompt,
  OpenPerplexSearchParameters,
  OpenPerplexSearchParametersSchemaForOpenAI,
} from "./prompt&type";
import { ModelForRefinement } from "../prompt&type";

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

export const refineParametersForOpenPerplex = {
  search: async (
    userQuery: string,
    conversationHistory: conversationHistory[],
    currentProcessingStep: (step: string) => void,
    modelForRefinement: ModelForRefinement
  ): Promise<OpenPerplexSearchParameters> => {
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

    if (modelForRefinement.model[1] === "OpenAI") {
      currentProcessingStep("Refining search parameters with OpenAI");
      console.log("Starting OpenAI API call for Search Query Refinement");
      try {
        //non-streaming response
        const response = await fetch(
          "/api/Models/OpenAI/SearchQueryRefinement",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: refimentmessages,
              model: modelForRefinement.model[0],
              response_format: {
                type: "json_schema",
                json_schema: OpenPerplexSearchParametersSchemaForOpenAI,
              },
              temperature: 0.2,
              max_tokens: 1000,
            }),
          }
        );

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

        console.log(
          "OpenAI API call for Search Query Refinement success, data",
          data
        );

        return data as OpenPerplexSearchParameters;
      } catch (error: any) {
        console.error(
          "Error in UserQueryRefinementForOpenPerplexSearch:",
          error
        );
        throw error;
      }
    }
    throw new Error("modelProvider not supported for refinement");
  },
};
