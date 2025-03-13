import { contextualisedInputPromptAfterSearch } from "../../utils/promt";
import {
  SearchResult,
  SearchParameters,
  ChatActions,
  SearchOutput,
  conversationHistory,
} from "../../utils/type";

import { UserQueryRefinementForOpenPerplexSearchUsingOpenAI } from "../../utils/API/Models/Agent/RefineUserQueryForSearch";
import { OpenPerplexSearch } from "../../utils/API/External/Search/OpenPerplex/OpenPerplexSearch";

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

export async function search(
  userMessage: string,
  chatHistory: conversationHistory[],
  actions: ChatActions,
  queryRefinement: boolean,
  queryRefinementModel: string
) {
  searchIO.initialQuery = userMessage;
  if (queryRefinement) {
    actions.setCurrentProcessingStep("Understanding");

    try {
      console.log(
        "Search Query Refinement using OpenAI API using model " +
          queryRefinementModel +
          " - Starting"
      );

      // const model = await getModel(queryRefinementModel);

      actions.setConversationHistory((prev) => [
        ...prev,
        {
          role: "user",
          content:
            "please refine my query " +
            searchIO.initialQuery +
            "based on ChatHistory for OpenPerplex Search API",
          timestamp: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
        },
      ]);

      const searchParameters =
        await UserQueryRefinementForOpenPerplexSearchUsingOpenAI(
          searchIO.initialQuery,
          queryRefinementModel,
          chatHistory
        );

      searchIO.searchParameters = searchParameters;

      console.log("Refined SearchParameters:", searchIO.searchParameters);

      actions.setCurrentProcessingStep("Intializing Search");

      console.log("Search Query Refinement using OpenAI API - Completed");
    } catch (error) {
      console.error(
        "Search Query Refinement Error" +
          "location: SearchHandler.ts" +
          ", error:" +
          error
      );

      actions.setCurrentProcessingStep("Intializing Search");
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

  actions.setCurrentProcessingStep("Searching");

  try {
    console.log("OpenPerplex Search API - Starting");

    const response = await OpenPerplexSearch(searchIO.searchParameters);

    const searchData = response;

    searchIO.OpenPerplexSearchOutput.sources = searchData.sources;
    searchIO.OpenPerplexSearchOutput.llm_response = searchData.llm_response;

    actions.setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.content = searchIO.OpenPerplexSearchOutput.llm_response;
        if (searchIO.OpenPerplexSearchOutput.sources.length > 0) {
          lastMessage.sources = searchIO.OpenPerplexSearchOutput.sources;
        } else {
          lastMessage.sources = [];
        }
      }
      return newMessages;
    });

    actions.setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "I have refined your initial query (" +
          searchIO.initialQuery +
          ") to " +
          searchIO.searchParameters.query +
          " and the search results from openperplex API are as follows: " +
          JSON.stringify(searchIO.OpenPerplexSearchOutput.sources) +
          " and the extracted content from openperplex API is " +
          searchIO.OpenPerplexSearchOutput.llm_response,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: queryRefinementModel,
        modelprovider: "OpenPerplex + OpenAI",
      },
    ]);

    let contextualizedInput = `${contextualisedInputPromptAfterSearch} 
    users Initial Question: "${searchIO.initialQuery}". 
    Search Results: ${JSON.stringify(searchIO.OpenPerplexSearchOutput.sources)}
    Extracted Content: ${searchIO.OpenPerplexSearchOutput.llm_response}`;

    return contextualizedInput;
  } catch (error) {
    console.error("Search failed:", error);
    actions.setCurrentProcessingStep("Search failed");
    return null;
  }
}
