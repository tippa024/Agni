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
  state: ChatState,
  actions: ChatActions
) {
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
  actions.setInput("");

  setMessage.NewRoleAndContent("user", userMessage, actions.setMessages);

  setConversationHistory.AddUserMessage(
    userMessage,
    state.location,
    state.userPreferences,
    actions.setConversationHistory
  );

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
      state.userPreferences.model[0],
      "from",
      state.userPreferences.model[1]
    );

    try {
      actions.setCurrentProcessingStep("Starting final response");

      let content = "";
      let updateTimeout;

      const data = await getModelStream(
        state.userPreferences.model[1],
        {
          userMessage: contextualizedInput,
          systemMessage: systemMessage.content,
          conversationHistory: state.conversationHistory,
          context: state.userPreferences.context,
          model: state.userPreferences.model[0],
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

      setConversationHistory.AddAssistantMessage(
        content,
        state.userPreferences.model[0],
        state.userPreferences.model[1],
        actions.setConversationHistory
      );
    } catch (error) {
      console.error("Error in Model Response:", error);
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
      state.userPreferences.model[0],
      state.userPreferences.model[1],
      actions.setConversationHistory
    );
  }
}
