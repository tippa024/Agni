import {
  ChatState,
  ChatActions,
  systemMessage,
  supportedModels,
  getSupportedModels,
} from "./Utils/prompt&type";
import {
  contextualisedInputPromptAfterSearch,
  SearchOutput,
} from "@/Search/Utils/prompt&type";

import { setMessage } from "./Handlers/Functions/setMessages";

import { getSearch } from "@/Search/Handlers/get";

import { getModelStream } from "@/Models/Stream/Handlers/getStream";

export async function handleRawUserInput(
  e: React.FormEvent,
  getState: () => ChatState,
  actions: ChatActions
) {
  const state = getState();

  e.preventDefault(); //still not sure if this is needed, but it's here - to be safe
  if (!state.input.trim()) return;

  const userMessage = state.input.trim();

  setMessage.NewUserMessage(
    userMessage,
    state.location,
    state.userPreferences,
    actions.setMessages
  );

  setMessage.InitialiseNewAssistant(actions.setMessages);

  try {
    let contextualizedInput = userMessage;

    if (state.userPreferences.searchEnabled) {
      actions.setCurrentProcessingStep("Searching...");

      const modelForRefinement = getSupportedModels().find(
        (model) => model.name === "4.1-Mini"
      ) as supportedModels;

      console.log("Model for refinement", modelForRefinement);

      try {
        const searchOutput = (await getSearch(
          userMessage,
          state.userPreferences.searchProvider,
          state.messages,
          actions.setCurrentProcessingStep,
          true,
          modelForRefinement
        )) as SearchOutput;

        const { sources, textOutput } = searchOutput;

        setMessage.SourcesToCurrent(sources, actions.setMessages);

        contextualizedInput = `${contextualisedInputPromptAfterSearch} users initial question: "${userMessage}". Search Results: ${JSON.stringify(
          sources
        )}Extracted Content: ${textOutput}`;
      } catch (error) {
        console.error("Error in OpenPerplex Refine Search:", error);
      }
    }

    actions.setCurrentProcessingStep("Take Off");

    try {
      actions.setCurrentProcessingStep("Starting final response");

      let content = "";
      let updateTimeout;

      const data = await getModelStream(
        state.userPreferences.model.provider,
        {
          userMessage: contextualizedInput,
          systemMessage: systemMessage.content,
          conversationHistory: state.messages,
          context: state.userPreferences.context,
          model: state.userPreferences.model,
          location: state.location,
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
    setMessage.NewAssistantMessage(
      "I apologize, but I encountered an error while processing your request. Please try again." +
        error,
      state.userPreferences.model.apiCallName,
      state.userPreferences.model.provider,
      actions.setMessages
    );
  }
}
