import { conversationHistory } from "@/app/lib/utils/type";
import {
  searchParametersSchema,
  SearchQueryPrompt,
} from "@/app/lib/utils/promt";
import { SearchParameters } from "@/app/lib/utils/type";

export const UserQueryRefinementForOpenPerplexSearchUsingOpenAI = async (
  userQuery: string,
  model: string,
  conversationHistory: conversationHistory[]
): Promise<SearchParameters> => {
  console.log(
    "Refining user query for OpenPerplex search using OpenAI model",
    model,
    userQuery
  );

  const refimentmessages = [
    {
      role: "system",
      content: ` ${
        SearchQueryPrompt.content
      } Consider the chat history for context: ${JSON.stringify(
        conversationHistory
      )} `,
    },
    { role: "user", content: userQuery },
  ];

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
          json_schema: searchParametersSchema,
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

    // Fix: Use response.json() as a method call instead of a property
    const data = await response.json();
    console.log("Refined SearchParameters:", data);

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

    return data as SearchParameters;
  } catch (error: any) {
    console.error("Error in UserQueryRefinementForOpenPerplexSearch:", error);
    throw error;
  }
};
