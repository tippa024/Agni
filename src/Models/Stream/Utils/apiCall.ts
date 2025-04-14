import { Message, supportedModels } from "@/Mediums/Chat/Utils/prompt&type";
import { createStreamFromResponse, StreamResponse } from "./function&type";

export const streamTextAPI = {
  Anthropic: async (
    systemMessage: string,
    messages: Array<Pick<Message, "role" | "content">>,
    model: supportedModels
  ): Promise<StreamResponse> => {
    console.log("Starting Anthropic API call");
    console.log("model details", model);
    const response = await fetch("/api/Models/Anthropic/Chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemMessage,
        messages,
        model: model.apiCallName,
        stream: true,
        pricing: model.pricing,
      }),
    });
    console.log("Response received from Anthropic API call");

    return createStreamFromResponse(response);
  },

  OpenAI: async (
    systemMessage: string,
    messages: Array<Pick<Message, "role" | "content">>,
    model: supportedModels
  ): Promise<StreamResponse> => {
    console.log("Starting OpenAI API call");
    const response = await fetch("/api/Models/OpenAI/Response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages,
        model: model.apiCallName,
        instructions: systemMessage,
        stream: true,
        temperature: 1,
        pricing: model.pricing,
      }),
    });

    return createStreamFromResponse(response);
  },
};
