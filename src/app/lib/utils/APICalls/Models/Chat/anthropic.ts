import { Message } from "../../../type";
import {
  createStreamFromResponse,
  StreamResponse,
} from "../../../Model/stream";

export async function StreamingChatUsingAnthropicAPICall(
  systemMessage: string,
  messages: Message[],
  model: string,
  onChunk?: (chunk: string) => void
): Promise<StreamResponse> {
  console.log("Starting Anthropic API call");
  const response = await fetch("/api/Models/Anthropic/Chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemMessage, messages, model }),
  });
  console.log("Response received from Anthropic API call");

  return createStreamFromResponse(response, onChunk);
}
