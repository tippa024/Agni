import { SearchOutput, ModelForRefinement } from "../prompt&type";
import { refineParametersForOpenPerplex } from "./refinePrameters";
import { OpenPerplexSearchParameters } from "./prompt&type";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";
import { fallbackSearchParametersForOpenPerplex } from "./refinePrameters";

export const OpenPerplexAPI = {
  Search: async (
    userQuery: string,
    conversation: Message[],
    currentProcessingStep: (step: string) => void,
    refimenmentNeeded: boolean,
    modelForRefinement: ModelForRefinement
  ): Promise<SearchOutput> => {
    console.log(
      "OpenPerplex Refine Search API Client - Starting",
      userQuery,
      conversation,
      refimenmentNeeded,
      modelForRefinement
    );

    let searchParameters = {
      ...fallbackSearchParametersForOpenPerplex,
      query: userQuery,
      date_context: `${new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}`,
    } as OpenPerplexSearchParameters;

    if (refimenmentNeeded) {
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

      if (searchData.error) {
        console.error("OpenPerplex Search API - Failed", searchData.error);
        throw new Error(searchData.error);
      }

      console.log("OpenPerplex Search API Client - Completed");

      return searchData as SearchOutput;
    } catch (error: any) {
      console.error("Error in OpenPerplexSearch:", error);
      throw new Error(error.message || "An error occurred");
    }
  },
};
