import { Message, systemMessage } from "../../../utils/Chat/prompt&type";
import { streamTextAPI } from "../../../utils/Model/Stream/apiCall";

export async function getModelStream(
  provider: string,
  params: {
    messages: Message[];
    model: string;
  }
) {
  if (provider === "Anthropic") {
    console.log("Starting Anthropic API call function");
    try {
      const data = await streamTextAPI.Anthropic(
        systemMessage.content,
        params.messages,
        params.model
      );

      console.log("Anthropic API call function success");
      return {
        stream: () => data.stream(),
        getText: async () => await data.getText(),
      };
    } catch (error) {
      console.error("Error in Anthropic streaming:", error);
      throw error;
    }
  }
  if (provider === "OpenAI") {
    console.log("Starting OpenAI API call function");
    try {
      const data = await streamTextAPI.OpenAI(
        systemMessage.content,
        params.messages,
        params.model
      );
      console.log("OpenAI API call function success");
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
