import { OpenPerplexAPI } from "@/Search/Utils/OpenPerplex/apiCall";
import { SearchOutput } from "@/Search/Utils/prompt&type";
import { Message, supportedModels } from "@/Mediums/Chat/Utils/prompt&type";

export const getSearch = async (
  query: string,
  searchProvider: string,
  conversation: Message[],
  currentProcessingStep: (step: string) => void,
  refinementNeeded: boolean,
  modelForRefinement: supportedModels
) => {
  console.log("Starting getSearch function");

  if (searchProvider === "OpenPerplex") {
    currentProcessingStep("Starting OpenPerplex Search");
    console.log("Getting search results from OpenPerplex:", {
      query,
      refinementNeeded,
      ...(refinementNeeded && { modelForRefinement }),
    });
    try {
      const response = await OpenPerplexAPI.Search(
        query,
        conversation,
        currentProcessingStep,
        refinementNeeded,
        modelForRefinement
      );
      const { sources, textOutput } = response;
      currentProcessingStep("Completed OpenPerplex Search");
      console.log("GetSearch function success");
      return { sources, textOutput } as SearchOutput;
    } catch (error) {
      throw error;
    }
  }
  throw new Error(`Search Provider ${searchProvider} not supported`);
};
