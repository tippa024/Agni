import { Message } from "../../../type";
import {
  createStreamFromResponse,
  StreamResponse,
} from "../../../Model/stream";

export async function StreamingChatUsingOpenAIAPICall(
  systemMessage: string,
  messages: Message[],
  model: string,
  onChunk?: (chunk: string) => void
): Promise<StreamResponse> {
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
}
