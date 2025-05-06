import { SearchOutput } from "../prompt&type";
import { refineParametersForOpenPerplex } from "./refinePrameters";
import { OpenPerplexSearchParameters } from "./prompt&type";
import { Message, supportedModels } from "@/Mediums/Chat/Utils/prompt&type";
import { fallbackSearchParametersForOpenPerplex } from "./refinePrameters";

export const OpenPerplexAPI = {
  Search: async (
    userQuery: string,
    conversation: Message[],
    currentProcessingStep: (step: string) => void,
    refinementNeeded: boolean,
    modelForRefinement: supportedModels
  ): Promise<SearchOutput> => {
    console.log("OpenPerplex Search API Client - Starting");

    let searchParameters = {
      ...fallbackSearchParametersForOpenPerplex,
      query: userQuery,
      date_context: `${new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}`,
    } as OpenPerplexSearchParameters;

    if (refinementNeeded) {
      currentProcessingStep("Refining search parameters");
      const refinedParameters = await refineParametersForOpenPerplex.search(
        userQuery,
        conversation,
        currentProcessingStep,
        modelForRefinement
      );
      searchParameters = refinedParameters;
    }

    currentProcessingStep("Searching with OpenPerplex");

    try {
      const response = await fetch(`/api/OpenPerplex/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParameters),
      });

      if (!response.ok) {
        console.log("Search failed using OpenPerplex API", response.statusText);
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const searchData = await response.json();

      const { sources, llm_response } = searchData;

      if (searchData.error) {
        console.error("OpenPerplex Search API - Failed", searchData.error);
        throw new Error(searchData.error);
      }

      console.log("OpenPerplex Search API Client - Completed", searchData);

      return { sources, textOutput: llm_response } as SearchOutput;
    } catch (error: any) {
      console.error("Error in OpenPerplexSearch:", error);
      throw new Error(error.message || "An error occurred");
    }
  },
};
