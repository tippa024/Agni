import {
  QueryRefinementPrompt,
  contextualisedInputPromptAfterSearch,
} from "../../utils/promt";
import { SearchResult, SearchParameters, ChatActions } from "../../utils/type";

const FALLBACK_SEARCH_PARAMS = {
  query: "",
  date_context: "",
  location: "in",
  pro_mode: false,
  response_language: "en",
  answer_type: "text",
  search_type: "general",
  verbose_mode: false,
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
    error: "",
  },
};

export async function search(
  userMessage: string,
  chatHistory: { role: string; content: string }[],
  actions: ChatActions,
  queryRefinement: boolean
) {
  searchIO.initialQuery = userMessage;
  if (queryRefinement) {
    const refimentmessages = [
      {
        role: "system",
        content: ` ${
          QueryRefinementPrompt.content
        } Consider the chat history for context: ${JSON.stringify(
          chatHistory
        )} `,
      },
      { role: "user", content: searchIO.initialQuery },
    ];

    actions.setConversationHistory((prev) => [...prev, ...refimentmessages]);
    actions.setCurrentProcessingStep("Refining Search Query");

    try {
      const response = await fetch("/api/OpenAI/SearchQueryRefinement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: refimentmessages,
        }),
      });

      console.log("Query Refinement - Completed");

      actions.setCurrentProcessingStep("Completed Refining Search Query");

      if (!response.ok) {
        throw new Error(
          `Failed to get response from Search Query Refinement: ${response.statusText}`
        );
      }

      searchIO.searchParameters = await response.json();
      console.log("Refined SearchParameters:", searchIO.searchParameters);
    } catch (error) {
      console.error(
        "Search Query Refinement Error in Search.ts line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          ", error:" +
          error
      );

      // Return fallback data with the current user message and timestamp
      const fallbackData = {
        ...FALLBACK_SEARCH_PARAMS,
        query: userMessage,
        date_context: `The current date is ${
          new Date().toISOString().split("T")[0]
        } and the current time is ${
          new Date().toISOString().split("T")[1].split(".")[0]
        }`,
      };
      console.log("Using fallback data:", fallbackData);

      searchIO.searchParameters = fallbackData;
    }
  }

  actions.setCurrentProcessingStep("Searching");

  try {
    const response = await fetch(`/api/OpenPerplex/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.OPENPERPLEX_API_KEY || "",
      },
      body: JSON.stringify(searchIO.searchParameters),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const searchData = await response.json();

    console.log("searchData", searchData);

    if (searchData.error) {
      throw new Error(searchData.error);
    }
    actions.setCurrentProcessingStep("Completed Searching");

    searchIO.OpenPerplexSearchOutput.sources = searchData.sources || [];
    searchIO.OpenPerplexSearchOutput.llm_response =
      searchData.llm_response || "";

    actions.setCurrentProcessingStep("Search Completed");

    // Update messages with search results
    actions.setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        if (searchIO.OpenPerplexSearchOutput.sources.length > 0) {
          lastMessage.sources = searchIO.OpenPerplexSearchOutput.sources;
        } else {
          lastMessage.content = "no-results";
          lastMessage.sources = [];
        }
      }
      return newMessages;
    });

    //add a placeholder message for the assistant response
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
