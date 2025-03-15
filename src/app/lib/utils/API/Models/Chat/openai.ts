import { Message } from "../../../type";

export async function StreamingChatUsingOpenAIAPICall(
  systemMessage: string,
  messages: Message[],
  model: string,
  onChunk?: (chunk: string) => void
) {
  console.log("Starting OpenAI API call");
  const response = await fetch("/api/Models/OpenAI/Chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "system", content: systemMessage }, ...messages],
      model: model,
    }),
  });

  console.log("Response received from OpenAI API");

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI Chat API Error Details:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(
      `Failed to get response from OpenAI API (${response.status}): ${errorText}`
    );
  }

  const decoder = new TextDecoder();

  return {
    stream: async function* () {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          if (chunk.trim()) {
            // Call the callback if provided
            if (onChunk) onChunk(chunk);

            // Yield the chunk for streaming
            yield chunk;
          }
        }
      } catch (streamError) {
        console.error("Error during streaming:", streamError);
        throw streamError;
      } finally {
        reader.releaseLock();
      }
    },

    async getText() {
      let fullText = "";
      for await (const chunk of this.stream()) {
        fullText += chunk;
      }
      return fullText;
    },
  };
}
