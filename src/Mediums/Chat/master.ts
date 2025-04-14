import { ChatState, ChatActions, systemMessage } from "./Utils/prompt&type";
import {
  contextualisedInputPromptAfterSearch,
  SearchOutput,
} from "@/Search/Utils/prompt&type";

import { setMessage } from "./Handlers/Functions/setMessages";
import { setConversationHistory } from "./Handlers/Functions/setConversation";

import { getSearch } from "@/Search/Handlers/get";

import { getModelStream } from "@/Models/Stream/Handlers/getStream";

export async function handleRawUserInput(
  e: React.FormEvent,
  getState: () => ChatState,
  actions: ChatActions
) {
  const state = getState();
  console.log("Initialising Master Handler", {
    userQuery: state.input,
    searchEnabled: state.userPreferences.searchEnabled,
    searchProvider: state.userPreferences.searchEnabled
      ? state.userPreferences.searchProvider
      : "noSearch",
    model: state.userPreferences.model,
  });

  actions.setCurrentProcessingStep("We are going for lift off");

  e.preventDefault(); //still not sure if this is needed, but it's here - to be safe
  if (!state.input.trim()) return;

  const userMessage = state.input.trim();

  setMessage.NewRoleAndContent("user", userMessage, actions.setMessages);

  setMessage.InitialiseNewAssistant(actions.setMessages);

  try {
    let contextualizedInput = userMessage;

    if (state.userPreferences.searchEnabled) {
      actions.setCurrentProcessingStep("Searching...");

      {
        try {
          const searchOutput = (await getSearch(
            userMessage,
            state.userPreferences.searchProvider,
            state.conversationHistory,
            actions.setCurrentProcessingStep,
            true,
            { model: ["gpt-4o-mini", "OpenAI"] }
          )) as SearchOutput;

          const { sources, textOutput } = searchOutput;

          setMessage.SourcesToCurrent(sources, actions.setMessages);

          contextualizedInput = `${contextualisedInputPromptAfterSearch} users initial question: "${userMessage}". Search Results: ${JSON.stringify(
            sources
          )}Extracted Content: ${textOutput}`;

          console.log("Input after search", contextualizedInput);
        } catch (error) {
          console.error("Error in OpenPerplex Refine Search:", error);
        }
      }
    }

    actions.setCurrentProcessingStep("Take Off");

    console.log(
      "Master Handler concluding with model:",
      state.userPreferences.model.apiCallName,
      "from",
      state.userPreferences.model.provider
    );

    try {
      actions.setCurrentProcessingStep("Starting final response");

      let content = "";
      let updateTimeout;

      const data = await getModelStream(
        state.userPreferences.model.provider,
        {
          userMessage: contextualizedInput,
          systemMessage: systemMessage.content,
          conversationHistory: state.conversationHistory,
          context: state.userPreferences.context,
          model: state.userPreferences.model,
        },
        actions.setCurrentProcessingStep
      );

      for await (const chunk of data.stream()) {
        content += chunk;
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          setMessage.UpdateAssistantContentandTimeStamp(
            content,
            actions.setMessages
          );
        }, 5);
      }
      actions.setCurrentProcessingStep("");

      setMessage.AddCostToCurrent(
        parseFloat(data.getTotalCost()),
        actions.setMessages
      );

      setConversationHistory.AddUserMessage(
        userMessage,
        state.location,
        state.userPreferences,
        actions.setConversationHistory
      );

      if (content.length > 0) {
        setConversationHistory.AddAssistantMessage(
          content,
          state.userPreferences.model.apiCallName,
          state.userPreferences.model.provider,
          actions.setConversationHistory
        );
      }
    } catch (error) {
      setMessage.UpdateAssistantContentandTimeStamp(
        "Daya chesi console log nu check chesukondi",
        actions.setMessages
      );
      actions.setCurrentProcessingStep("");
    }
  } catch (error) {
    console.error("Chat Submit Handler - Error:", error);
    actions.setCurrentProcessingStep("");
    setMessage.NewRoleAndContent(
      "assistant",
      "I apologize, but I encountered an error while processing your request. Please try again." +
        error,
      actions.setMessages
    );
    setConversationHistory.AddAssistantMessage(
      "I apologize, but I encountered an error while processing your request. Please try again.",
      state.userPreferences.model.apiCallName,
      state.userPreferences.model.provider,
      actions.setConversationHistory
    );
  }
}
