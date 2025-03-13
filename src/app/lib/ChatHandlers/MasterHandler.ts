import { search } from "./2.Agents/SearchHandler";
import {
  OpenAIChatResponse,
  AnthropicChatResponse,
} from "./3.Output/FinalResponseHandler";
import { ChatState, ChatActions } from "../utils/type";
import { ReadAllContextFilesNamesAndContent } from "../utils/API/History/Context/ReadAllNamesandContent";

// Main function to handle chat form submissions
export async function handleRawUserInput(
  e: React.FormEvent,
  state: ChatState,
  actions: ChatActions
) {
  actions.setCurrentProcessingStep("Understanding User Input");

  //console.log( "Current line number:", new Error().stack?.split("\n")[1]?.trim().split(":").pop() || "unknown");

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
      context: state.context,
    });

    let contextualizedInput = userMessage;

    // If search is enabled, perform search operations
    if (state.userPreferences.searchEnabled) {
      const queryrefinementneeded = true;
      const queryrefinementmodel = "gpt-4o-mini";

      try {
        const searchdatainfusedquery = await search(
          userMessage,
          state.conversationHistory,
          actions,
          queryrefinementneeded,
          queryrefinementmodel
        );
        if (searchdatainfusedquery) {
          contextualizedInput = searchdatainfusedquery;
        }
      } catch (error) {
        console.error("Error in SearchHandler.ts", error);
      }
    }

    if (state.context) {
      const context = await ReadAllContextFilesNamesAndContent();
      console.log(context);
      contextualizedInput += `\n\nContext:\n${context.files
        .map((file: any) => file.content)
        .join("\n")}`;
    }

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: contextualizedInput,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        location: state.location || undefined,
      },
    ]);

    actions.setCurrentProcessingStep("Final Response");

    // Prepare messages for the API call
    const messages = [
      ...state.conversationHistory
        .filter((msg) => msg.role !== "system")
        .reduce((acc: any[], msg, index, array) => {
          // Only push role and content from the message
          acc.push({
            role: msg.role,
            content: msg.content,
          });
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
          state.userPreferences.model[0],
          state.location || null
        );
        actions.setCurrentProcessingStep("");
        console.log(
          "Anthropic Chat API Response completed - Master Handler is retiring"
        );
      } catch (error) {
        console.error(
          "Error in Anthropic chat response in MasterHandler.ts",
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
          state.userPreferences.model[0],
          state.location || null
        );
        actions.setCurrentProcessingStep("");
        console.log(
          "OpenAI Chat API Response completed - Master Handler is retiring"
        );
      } catch (error) {
        console.error(
          "Error in OpenAI chat response in MasterHandler.ts",
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
          "location: MasterHandler.ts" +
          error,
        searchResults: [],
      },
    ]);
    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        location: state.location || undefined,
      },
      {
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again." +
          "location: MasterHandler.ts" +
          error,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: state.userPreferences.model[0],
        modelprovider: state.userPreferences.model[1],
        location: state.location || undefined,
      },
    ]);
  }
}
