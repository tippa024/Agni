import { Message, supportedModels } from "@/Mediums/Chat/Utils/prompt&type";
import { StreamlineConversationForAPI } from "./prepareMessages";
import { streamTextAPI } from "../Utils/apiCall";
import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
import { getAstrologicalData } from "@/lib/Astrology/handler";
import { astrologyPrompt } from "@/lib/Astrology/prompt&type";
export async function getModelStream(
  provider: string,
  params: {
    userMessage: string;
    systemMessage: string;
    conversationHistory: Message[];
    context: boolean;
    model: supportedModels;
    location: { latitude: number; longitude: number };
  },
  currentProcessingStep: (step: string) => void
) {
  const { astrologicalDataResult } = await getAstrologicalData(
    params.location.latitude,
    params.location.longitude
  );

  const astrologicalPrompt = astrologyPrompt(astrologicalDataResult);

  params.systemMessage += astrologicalPrompt;

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
  let messagesForModel: Array<Pick<Message, "role" | "content">> = [];

  if (params.conversationHistory) {
    const updatedHistory = [
      ...params.conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      { role: "user" as const, content: userMessage },
    ];
    messagesForModel = StreamlineConversationForAPI(updatedHistory) as Array<
      Pick<Message, "role" | "content">
    >;
  } else {
    messagesForModel = [
      { role: "user" as const, content: userMessage },
    ] as Array<Pick<Message, "role" | "content">>;
  }
  currentProcessingStep(`${provider} response`);

  try {
    const data = await streamTextAPI[provider as keyof typeof streamTextAPI](
      params.systemMessage,
      messagesForModel,
      model
    );

    return {
      stream: () => data.stream(),
      getText: async () => await data.getText(),
      getTotalCost: () => data.getTotalCost(),
      getInputCost: () => data.getInputCost(),
      getCachedInputCost: () => data.getCachedInputCost(),
      getOutputCost: () => data.getOutputCost(),
    };
  } catch (error) {
    console.error(`Error in ${provider} streaming:`, error);
    throw error;
  }
}
