import { Message } from "@/Mediums/Chat/Utils/prompt&type";
import { createStreamFromResponse, StreamResponse } from "./function&type";

export const streamTextAPI = {
  Anthropic: async (
    systemMessage: string,
    messages: Message[],
    model: string
  ): Promise<StreamResponse> => {
    console.log("Starting Anthropic API call");
    const response = await fetch("/api/Models/Anthropic/Chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemMessage, messages, model }),
    });
    console.log("Response received from Anthropic API call");

    return createStreamFromResponse(response);
  },

  OpenAI: async (
    systemMessage: string,
    messages: Message[],
    model: string
  ): Promise<StreamResponse> => {
    console.log("Starting OpenAI API call");
    const response = await fetch("/api/Models/OpenAI/Chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemMessage }, ...messages],
        model: model,
      }),
    });

    return createStreamFromResponse(response);
  },
};
