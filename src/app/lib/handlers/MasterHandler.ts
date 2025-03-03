import { search } from "./2.Agents/SearchHandler";
import { main } from "./2.Agents/TwitterHandler";
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
    console.log("Initialising Master Handler", {
      userMessage,
      searchEnabled: state.userPreferences.searchEnabled,
      model: state.userPreferences.model,
    });

    let contextualizedInput = userMessage;

    // If search is enabled, perform search operations
    if (state.userPreferences.searchEnabled) {
      const queryrefinementneeded = true;

      try {
        const searchdatainfusedquery = await search(
          userMessage,
          state.conversationHistory,
          actions,
          queryrefinementneeded
        );
        if (searchdatainfusedquery) {
          contextualizedInput = searchdatainfusedquery;
        }
      } catch (error) {
        console.error(
          "Error in SearchHandler.ts line:" +
            new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
            ", error:" +
            error
        );
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
      "Master Handler concluding with model:",
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
        console.log(
          "Anthropic Chat API Response completed - Master Handler is retiring"
        );
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
        console.log(
          "OpenAI Chat API Response completed - Master Handler is retiring"
        );
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
          "location: MasterHandler.ts line:" +
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
          "location: MasterHandler.ts line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          error,
      },
    ]);
  }
}
