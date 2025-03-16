export interface StreamResponse {
  stream: () => AsyncGenerator<string, void, unknown>;
  getText: () => Promise<string>;
}

export async function createStreamFromResponse(
  response: Response,
  onChunk?: (chunk: string) => void
): Promise<StreamResponse> {
  console.log("Creating stream from response");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Details:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(
      `Failed to get response from API (${response.status}): ${errorText}`
    );
  }

  const decoder = new TextDecoder();

  const streamFn = async function* () {
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
      console.log("Stream finished");
    } catch (streamError) {
      console.error("Error during streaming:", streamError);
      throw streamError;
    } finally {
      reader.releaseLock();
    }
  };

  return {
    stream: streamFn,
    async getText() {
      let fullText = "";
      for await (const chunk of streamFn()) {
        fullText += chunk;
      }
      return fullText;
    },
  };
}
