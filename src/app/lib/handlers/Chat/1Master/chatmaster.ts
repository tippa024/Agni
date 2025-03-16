import { ChatState, ChatActions } from "../../../utils/Chat/prompt&type";
import { contextualisedInputPromptAfterSearch } from "../../../utils/Search/prompt&type";

import { setMessage } from "../Messages/set";
import { setConversationHistory } from "../ConversationHistory/set";

import { SearchParameters } from "@/app/lib/utils/Search/prompt&type";
import { queryRefinementForSearch } from "../Agents/Refine/forSearch";
import { getSearch } from "../Agents/Search/get";

import { ReadAllContextFilesNamesAndContent } from "../../../utils/APICalls/History/Context/ReadAllNamesandContent";

import { StreamlineConversationForAPI } from "../../Model/prepareMessages";
import { getModelStream } from "../../Model/getStream";

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
    context: state.context,
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
      actions.setCurrentProcessingStep("starting search");
      let searchParameters;

      try {
        actions.setCurrentProcessingStep("refining query");
        const refinedQuery = (await queryRefinementForSearch(
          state.userPreferences.searchProvider,
          userMessage,
          state.conversationHistory
        )) as SearchParameters;
        searchParameters = refinedQuery;

        // Only proceed with search if we have valid search parameters
        if (searchParameters) {
          actions.setCurrentProcessingStep("getting search results");
          const searchOutput = await getSearch(
            state.userPreferences.searchProvider,
            searchParameters
          );

          const { sources, textOutput } = searchOutput;

          setMessage.SourcesToCurrent(sources, actions.setMessages);

          setMessage.InitialiseNewAssistant(actions.setMessages);

          contextualizedInput = `${contextualisedInputPromptAfterSearch} users initial question: "${userMessage}". Search Results: ${JSON.stringify(
            sources
          )}Extracted Content: ${textOutput}`;
        } else {
          console.log("No valid search parameters returned from refinement");
        }
      } catch (error) {
        console.error("Error in search process:", error);
      }
    }

    if (state.context) {
      actions.setCurrentProcessingStep("loading context");
      try {
        const context = await ReadAllContextFilesNamesAndContent();
        contextualizedInput += `\n\nContext for your reference during the conversation:\n${context.files
          .map((file: any) => file.content)
          .join("\n")}`;
      } catch (error) {
        console.error("Error loading context:", error);
      }
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
      actions.setCurrentProcessingStep("getting model response");
      let content = "";
      const data = await getModelStream(state.userPreferences.model[1], {
        messages: messagesForModel,
        model: state.userPreferences.model[0],
      });
      for await (const chunk of data.stream()) {
        content += chunk;
        setMessage.UpdateAssistantContent(content, actions.setMessages);
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
