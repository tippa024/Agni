export interface StreamResponse {
  stream: () => AsyncGenerator<string, void, unknown>;
  getText: () => Promise<string>;
  getInputCost: () => string;
  getCachedInputCost: () => string;
  getOutputCost: () => string;
  getTotalCost: () => string;
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
  const inputCost = response.headers.get("X-Input-Cost") || "0";
  const cachedInputCost = response.headers.get("X-Cached-Input-Cost") || "0";
  const outputCost = response.headers.get("X-Output-Cost") || "0";
  const totalCost = response.headers.get("X-Total-Cost") || "0";

  const streamFn = async function* () {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          if (onChunk) onChunk(chunk);
          yield chunk;
        }
      }
    } catch (streamError) {
      console.error("Error during streaming:", streamError);
      throw streamError;
    } finally {
      reader?.releaseLock();
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
    getTotalCost() {
      return totalCost;
    },
    getInputCost() {
      return inputCost;
    },
    getCachedInputCost() {
      return cachedInputCost;
    },
    getOutputCost() {
      return outputCost;
    },
  };
}
