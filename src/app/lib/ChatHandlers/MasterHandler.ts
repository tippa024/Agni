import { ChatState, ChatActions } from "../utils/type";
import { contextualisedInputPromptAfterSearch } from "../utils/promt";

import { SetMessage } from "./Messages/Set";
import { setConversationHistory } from "./ConversationHistory/Set";
import { StreamlineConversationForAPI } from "./Models/StreamlineConversationforAPI";

import { SearchUsingOpenPerplex } from "./2.Agents/Search/OpenPerplex/SearchHandler";
import {
  OpenAIChatResponse,
  AnthropicChatResponse,
} from "./3.Output/FinalResponseHandler";

import { getModelStream } from "./Models/getModelStream";

import { ReadAllContextFilesNamesAndContent } from "../utils/API/History/Context/ReadAllNamesandContent";

import { set } from "zod";

export async function handleRawUserInput(
  e: React.FormEvent,
  state: ChatState,
  actions: ChatActions
) {
  console.log("Initialising Master Handler", {
    userQuery: state.input,
    searchEnabled: state.userPreferences.searchEnabled,
    model: state.userPreferences.model,
    context: state.context,
  });

  actions.setCurrentProcessingStep("We are going for lift off");

  e.preventDefault(); //still not sure if this is needed, but it's here - to be safe
  if (!state.input.trim()) return;

  const userMessage = state.input.trim();
  actions.setInput("");

  SetMessage.NewRoleAndContent("user", userMessage, actions.setMessages);

  setConversationHistory.AddUserMessage(
    userMessage,
    state.location,
    state.userPreferences,
    actions.setConversationHistory
  );

  SetMessage.InitialiseNewAssistant(actions.setMessages);

  try {
    actions.setCurrentProcessingStep(
      "Initializing main logic of master handler"
    );

    let contextualizedInput = userMessage;

    if (state.userPreferences.searchEnabled) {
      actions.setCurrentProcessingStep(
        "User Request for a Search - Initializing search within master handler"
      );

      //hardcoded for now
      const queryrefinementneeded = true;
      const queryrefinementmodel = "gpt-4o-mini";

      try {
        actions.setCurrentProcessingStep(
          "Initiating search using " + state.userPreferences.searchProvider
        );

        const searchData = await SearchUsingOpenPerplex(
          userMessage,
          state.conversationHistory,
          actions.setCurrentProcessingStep,
          queryrefinementneeded,
          queryrefinementmodel
        );
        if (searchData) {
          const { sources, contextMessage } = searchData;

          SetMessage.SourcesToCurrent(sources, actions.setMessages);

          SetMessage.InitialiseNewAssistant(actions.setMessages);

          contextualizedInput = `${contextualisedInputPromptAfterSearch} users initial question: "${userMessage}". Search Results: ${JSON.stringify(
            sources
          )}Extracted Content: ${contextMessage}`;
        }
      } catch (error) {
        console.error("Error in SearchHandler.ts", error);
      }
    }

    if (state.context) {
      const context = await ReadAllContextFilesNamesAndContent();
      contextualizedInput += `\n\nContext for your reference during the conversation:\n${context.files
        .map((file: any) => file.content)
        .join("\n")}`;
    }

    actions.setCurrentProcessingStep("Take Off");

    const messagesForModel = [
      ...StreamlineConversationForAPI(state.conversationHistory),
      { role: "user", content: contextualizedInput },
    ];

    console.log(
      "Master Handler concluding with model:",
      state.userPreferences.model[0]
    );

    try {
      let content = "";
      const data = await getModelStream(state.userPreferences.model[1], {
        messages: messagesForModel,
        model: state.userPreferences.model[0],
        systemMessage: "You are a helpful assistant",
      });
      for await (const chunk of data.stream()) {
        content += chunk;
        SetMessage.UpdateAssistantContent(content, actions.setMessages);
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

    if (state.userPreferences.model[1] === "Anthropic") {
      {
        /*
      let content = "";
      
      try {
        const trial = await StreamingChatUsingAnthropicAPICall(
          "You are a helpful assistant",
          messagesForModel,
          state.userPreferences.model[0]
        );
        for await (const chunk of trial.stream()) {
          content += chunk;
          SetMessage.UpdateAssistantContent(content, actions.setMessages);
        } //initialising
        actions.setCurrentProcessingStep("");
        setConversationHistory.AddAssistantMessage(
          content,
          state.userPreferences.model[0],
          state.userPreferences.model[1],
          actions.setConversationHistory
        );
      } catch (error) {
        console.error(
          "Error in Anthropic chat response in MasterHandler.ts",
          error
        );
        actions.setCurrentProcessingStep("");
    }
    */
      }
      {
        /*


      try {
        const finalChatOutput = await AnthropicChatResponse(
          messagesForModel,
          actions,
          state.userPreferences.model[0],
          state.location || null
        );

        setConversationHistory.AddAssistantMessage(
          finalChatOutput,
          state.userPreferences.model[0],
          state.userPreferences.model[1],
          actions.setConversationHistory
        );

        actions.setCurrentProcessingStep("");
      } catch (error) {
        SetMessage.UpdateAssistantContent(
          "I apologize, but I encountered an error while processing your request. Please try again." +
            error,
          actions.setMessages
        );

        console.error(
          "Error in Anthropic chat response in MasterHandler.ts",
          error
        );
        actions.setCurrentProcessingStep("");
        }
        */
      }
    }

    {
      /*

    if (state.userPreferences.model[1] === "OpenAI") {
      try {
        const finalChatOutput = await OpenAIChatResponse(
          messagesForModel,
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
    */
    }
  } catch (error) {
    console.error("Chat Submit Handler - Error:", error);
    actions.setCurrentProcessingStep("");
    SetMessage.NewRoleAndContent(
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
