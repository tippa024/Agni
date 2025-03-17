import { SearchParameters } from "@/app/lib/utils/Search/prompt&type";
import { conversationHistory } from "../../../utils/Chat/prompt&type";
import {
  fallbackSearchParametersForOpenPerplex,
  refineParametersForOpenPerplexSearch,
} from "../../../utils/OpenPerplex/Search/refinePrameters";
import { OpenPerplexSearchParameters } from "@/app/lib/utils/OpenPerplex/Search/prompt&type";
export const queryRefinementForSearch = async (
  searchProvider: string,
  userMessage: string,
  model: string,
  modelProvider: string,
  conversationHistory: conversationHistory[]
) => {
  console.log("Starting Refining user query function for search");

  if (searchProvider === "OpenPerplex") {
    try {
      const refinedQuery = await refineParametersForOpenPerplexSearch(
        userMessage,
        conversationHistory,
        model,
        modelProvider
      );

      console.log("Refined query function success", refinedQuery);

      return refinedQuery as SearchParameters;
    } catch (error) {
      console.error("Error in queryRefinementForSearch Function:", error);
      console.log("using fallback search parameters");
      const fallbackData = {
        ...fallbackSearchParametersForOpenPerplex,
        query: userMessage,
        date_context: `${new Date().getTimezoneOffset()}`,
      };
      return fallbackData as SearchParameters;
    }
  }
  console.log(
    "Search provider not supported by Refine function",
    searchProvider
  );
  throw new Error(`Search Provider ${searchProvider} not supported`);
};
