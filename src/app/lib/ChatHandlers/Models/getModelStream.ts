import { Message } from "../../utils/type";
import { systemMessage } from "../../utils/promt";
import { StreamingChatUsingAnthropicAPICall } from "../../utils/API/Models/Chat/anthropic";
import { StreamingChatUsingOpenAIAPICall } from "../../utils/API/Models/Chat/openai";

export async function getModelStream(
  provider: string,
  params: {
    messages: Message[];
    model: string;
    systemMessage?: string;
  }
) {
  if (provider === "Anthropic") {
    try {
      const data = await StreamingChatUsingAnthropicAPICall(
        systemMessage.content,
        params.messages,
        params.model
      );

      // Ensure we're properly returning the stream and getText functions
      return {
        stream: () => data.stream(),
        getText: async () => await data.getText(),
      };
    } catch (error) {
      console.error("Error in Anthropic streaming:", error);
      // Re-throw the error to let the caller handle it
      throw error;
    }
  }
  if (provider === "OpenAI") {
    try {
      const data = await StreamingChatUsingOpenAIAPICall(
        systemMessage.content,
        params.messages,
        params.model
      );
      return {
        stream: () => data.stream(),
        getText: async () => await data.getText(),
      };
    } catch (error) {
      console.error("Error in OpenAI streaming:", error);
      throw error;
    }
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
