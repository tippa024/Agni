import { conversationHistory, Message } from "@/Mediums/Chat/Utils/prompt&type";
import { StreamlineConversationForAPI } from "./prepareMessages";
import { streamTextAPI } from "../Utils/apiCall";
import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";

export async function getModelStream(
  provider: string,
  params: {
    userMessage: string;
    systemMessage: string;
    conversationHistory?: conversationHistory[];
    context?: boolean;
    model: string;
  },
  currentProcessingStep: (step: string) => void
) {
  if (params.context) {
    currentProcessingStep("loading context");
    try {
      const context = await MarkdownAPI.ReadAllContextFilesNamesAndContent();
      params.systemMessage += `\n\nContext for your reference during the conversation:\n${context.files
        .map((file: any) => file.content)
        .join("\n")}`;
    } catch (error) {
      console.error("Error loading context:", error);
    }
  }

  const model = params.model;
  const userMessage = params.userMessage;
  const systemMessage = params.systemMessage;
  let messagesForModel: Message[] = [];

  if (params.conversationHistory) {
    messagesForModel = [
      ...StreamlineConversationForAPI(params.conversationHistory),
      { role: "user", content: userMessage },
    ] as Message[];
  } else {
    messagesForModel = [{ role: "user", content: userMessage }] as Message[];
  }
  currentProcessingStep(`${provider} response`);
  
  console.log(`Starting ${provider} API call function`);
  try {
    const data = await streamTextAPI[provider as keyof typeof streamTextAPI](
      systemMessage,
      messagesForModel,
      model
    );

    console.log(`${provider} API call function success`);
    return {
      stream: () => data.stream(),
      getText: async () => await data.getText(),
    };
  } catch (error) {
    console.error(`Error in ${provider} streaming:`, error);
    throw error;
  }
}
