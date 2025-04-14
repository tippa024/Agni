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
  let inputCost = "0";
  let cachedInputCost = "0";
  let outputCost = "0";
  let totalCost = "0";

  const streamFn = async function* () {
    try {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process SSE format
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.type === "costs") {
                // Update costs from the stream and format as currency (USD)
                inputCost = data.inputCost;
                cachedInputCost = data.cachedInputCost;
                outputCost = data.outputCost;
                totalCost = data.totalCost;
              } else if (data.type === "content" && data.content) {
                if (onChunk) onChunk(data.content);
                yield data.content;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e, line);
            }
          }
        }
      }
    } catch (streamError) {
      console.error("Error during streaming:", streamError);
      throw streamError;
    } finally {
      reader?.releaseLock();
    }
  };

  // Helper function to format cost as USD currency
  const formatAsCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "$0.00";
    return `$${numValue.toFixed(6)}`;
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
