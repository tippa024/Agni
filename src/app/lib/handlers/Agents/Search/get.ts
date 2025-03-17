import { OpenPerplexSearch } from "../../../utils/OpenPerplex/Search/apiCall";
import {
  SearchParameters,
  SearchOutput,
} from "../../../utils/Search/prompt&type";

export const getSearch = async (
  provider: string,
  searchParameters: SearchParameters
) => {
  console.log("Starting getSearch function");
  if (provider === "OpenPerplex") {
    console.log("Getting search results from OpenPerplex", searchParameters);
    try {
      const response = await OpenPerplexSearch(searchParameters);
      const { sources, llm_response } = response;
      console.log("GetSearch function success");
      return { sources, textOutput: llm_response };
    } catch (error) {
      console.error("Error in getSearch for OpenPerplex", error);
      return { sources: [], textOutput: "Error in getSearch" } as SearchOutput;
    }
  }
  throw new Error(`Search Provider ${provider} not supported`);
};
