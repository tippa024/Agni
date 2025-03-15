import {
  SearchResult,
  SearchParameters,
  ChatActions,
  SearchOutput,
  conversationHistory,
} from "../../../../utils/type";

import { UserQueryRefinementForOpenPerplexSearchUsingOpenAI } from "../../../../utils/API/Models/Agent/RefineUserQueryForSearch";
import { OpenPerplexSearch } from "../../../../utils/API/External/Search/OpenPerplex/OpenPerplexSearch";

const FALLBACK_SEARCH_PARAMS = {
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
} as const;

let searchIO = {
  initialQuery: "",
  searchParameters: {} as SearchParameters,
  OpenPerplexSearchOutput: {
    sources: [] as SearchResult[],
    llm_response: "",
    responsetime: 0,
    error: "",
  } as SearchOutput,
};

export async function SearchUsingOpenPerplex(
  userMessage: string,
  chatHistory: conversationHistory[],
  setCurrentProcessingStep: ChatActions["setCurrentProcessingStep"],
  queryRefinement: boolean,
  queryRefinementModel: string
) {
  searchIO.initialQuery = userMessage;
  if (queryRefinement) {
    setCurrentProcessingStep("Refining");

    try {
      console.log(
        "Search Query Refinement using OpenAI API using " +
          queryRefinementModel +
          " - Starting"
      );

      const searchParameters =
        await UserQueryRefinementForOpenPerplexSearchUsingOpenAI(
          searchIO.initialQuery,
          queryRefinementModel,
          chatHistory
        );

      searchIO.searchParameters = searchParameters;

      console.log("Refined SearchParameters:", searchIO.searchParameters);

      console.log("Search Query Refinement using OpenAI API - Completed");
    } catch (error) {
      console.error(
        "Search Query Refinement Error" +
          "location: SearchHandler.ts" +
          ", error:" +
          error
      );

      console.log("Search Query Refinement using OpenAI API - Failed");

      // Return fallback data with the current user message and timestamp
      const fallbackData = {
        ...FALLBACK_SEARCH_PARAMS,
        query: userMessage,
        date_context: `${new Date()}`,
      };
      console.log("Using fallback data:", fallbackData);

      searchIO.searchParameters = fallbackData;
    }
  }

  setCurrentProcessingStep("Searching");

  try {
    console.log("OpenPerplex Search API - Starting");

    const response = await OpenPerplexSearch(searchIO.searchParameters);

    const { sources, llm_response } = response;

    return { sources, contextMessage: llm_response };
  } catch (error) {
    console.error("Search failed:", error);
    setCurrentProcessingStep("Search failed");
    return null;
  }
}
