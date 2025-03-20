import { OpenPerplexAPI } from "@/Search/Utils/OpenPerplex/apiCall";
import { ModelForRefinement, SearchOutput } from "@/Search/Utils/prompt&type";
import { conversationHistory } from "@/Mediums/Chat/Utils/prompt&type";

export const getSearch = async (
  query: string,
  searchProvider: string,
  conversationHistory: conversationHistory[],
  currentProcessingStep: (step: string) => void,
  refimenmentNeeded: boolean,
  modelForRefinement: ModelForRefinement
) => {
  console.log("Starting getSearch function");

  if (searchProvider === "OpenPerplex") {
    currentProcessingStep("Starting OpenPerplex Search");
    console.log(
      "Getting search results from OpenPerplex",
      query,
      "with refimenmentNeeded",
      refimenmentNeeded,
      refimenmentNeeded ? { "and modelForRefinement": modelForRefinement } : {}
    );
    try {
      const response = await OpenPerplexAPI.Search(
        query,
        conversationHistory,
        currentProcessingStep,
        refimenmentNeeded,
        modelForRefinement
      );
      const { sources, textOutput } = response;
      currentProcessingStep("Completed OpenPerplex Search");
      console.log("GetSearch function success");
      return { sources, textOutput } as SearchOutput;
    } catch (error) {
      console.error("Error in getSearch for OpenPerplex", error);
      throw error;
    }
  }
  throw new Error(`Search Provider ${searchProvider} not supported`);
};
