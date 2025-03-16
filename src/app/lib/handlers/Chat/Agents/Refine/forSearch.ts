import { conversationHistory } from "../../../../utils/type";
import { OpenPerplexSearchParameters } from "../../../../utils/OpenPerplex/Search/prompt&type";
import { refineParametersForOpenPerplexSearch } from "../../../../utils/OpenPerplex/Search/refinePrameters";

const FALLBACK_SEARCH_PARAMS_For_OpenPerplex = {
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

export const queryRefinementForSearch = async (
  searchProvider: string,
  userMessage: string,
  conversationHistory: conversationHistory[]
) => {
  console.log("Starting Refining user query function for search");

  if (searchProvider === "OpenPerplex") {
    try {
      const refinedQuery = await refineParametersForOpenPerplexSearch(
        userMessage,
        conversationHistory,
        "gpt-4o-mini",
        "OpenAI"
      );

      console.log("Refined query function success", refinedQuery);

      return refinedQuery;
    } catch (error) {
      console.error("Error in UserQueryRefinementForSearch:", error);
      console.log("using fallback search parameters");
      const fallbackData = {
        ...FALLBACK_SEARCH_PARAMS_For_OpenPerplex,
        query: userMessage,
        date_context: `${new Date().getTimezoneOffset()}`,
      };
      return fallbackData as OpenPerplexSearchParameters;
    }
  }
  console.log(
    "Search provider not supported by Refine function",
    searchProvider
  );
  throw new Error(`Search Provider ${searchProvider} not supported`);
};
