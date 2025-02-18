import { search } from "./2.Agents/SearchHandler";
import {
  OpenAIChatResponse,
  AnthropicChatResponse,
} from "./3.Output/FinalResponseHandler";
import { ChatState, ChatActions, SearchResult } from "../utils/type";

// Main function to handle chat form submissions
export async function handleRawUserInput(
  e: React.FormEvent,
  state: ChatState,
  actions: ChatActions
) {
  actions.setCurrentProcessingStep("Understanding User Input");

  e.preventDefault(); //still not sure if this is needed, but it's here to be safe
  if (!state.input.trim()) return;

  // Get user message and clear input field
  const userMessage = state.input.trim();
  actions.setInput("");

  // Add user message to chat history
  actions.setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: userMessage,
    },
  ]);

  //initialise the assistant response
  actions.setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content: "",
    },
  ]);

  try {
    console.log("Chat Submit Handler - Starting", {
      userMessage,
      searchEnabled: state.userPreferences.searchEnabled,
      model: state.userPreferences.model,
    });
    let contextualizedInput = userMessage;
    let searchContext = {
      results: [] as SearchResult[],
      extractedContent: "",
      initialQuery: userMessage,
      refinedQuery: "",
    };

    //future scoping: intial query understanding: understand the user's intent and figure out which models to use, which sources are needed, and what are the apis needed to be used along with the optimimal parameters for the apis

    // If search is enabled, perform search operations
    if (state.userPreferences.searchEnabled) {
      const queryrefinementneeded = true;
      const searchdatainfusedquery = await search(
        searchContext.initialQuery,
        state.conversationHistory,
        actions,
        queryrefinementneeded
      );
      if (searchdatainfusedquery) {
        contextualizedInput = searchdatainfusedquery;
      }
    }

    actions.setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: contextualizedInput },
    ]);

    actions.setCurrentProcessingStep("Final Response");

    // Prepare messages for the API call
    const messages = [
      ...state.conversationHistory
        .filter((msg) => msg.role !== "system")
        .reduce((acc: any[], msg, index, array) => {
          acc.push(msg);
          if (
            msg.role === "user" &&
            index < array.length - 1 &&
            array[index + 1].role !== "assistant"
          ) {
            acc.push({
              role: "assistant",
              content:
                "Acknowledged, but there was an issue processing your request. Please try again.",
            });
          }
          return acc;
        }, []),
      { role: "user", content: contextualizedInput },
    ];

    console.log(
      "Chat Submit Handler - Starting with model:",
      state.userPreferences.model[0]
    );

    if (state.userPreferences.model[1] === "Anthropic") {
      try {
        const finalChatOutput = await AnthropicChatResponse(
          messages,
          actions,
          state.userPreferences.model[0]
        );
        actions.setCurrentProcessingStep("");
      } catch (error) {
        console.error(
          "Error in Anthropic chat response in MasterHandler.ts line:" +
            new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
            ", error:" +
            error
        );
        actions.setCurrentProcessingStep("");
      }
    }

    if (state.userPreferences.model[1] === "OpenAI") {
      try {
        const finalChatOutput = await OpenAIChatResponse(
          messages,
          actions,
          state.userPreferences.model[0]
        );
        actions.setCurrentProcessingStep("");
      } catch (error) {
        console.error(
          "Error in OpenAI chat response in MasterHandler.ts line:" +
            new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
            ", error:" +
            error
        );
        actions.setCurrentProcessingStep("");
      }
    }
  } catch (error) {
    console.error("Chat Submit Handler - Error:", error);
    actions.setCurrentProcessingStep("");
    actions.setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again." +
          "location: MasterHandler.ts - handleRawUserInput line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          error,
        searchResults: [],
      },
    ]);
    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
      {
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again." +
          "location: MasterHandler.ts - handleRawUserInput line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          error,
      },
    ]);
  }
}
