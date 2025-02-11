import { systemMessage } from "../utils/promt";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

// Define the structure of a chat message
interface Message {
  index: number;
  role: "user" | "assistant" | "system";
  content: string;
  additionalInfo?: {
    externalLinks?: SearchResult[];
    Context?: string;
  };
}

// Define the state shape for the chat interface
interface ChatState {
  messages: Message[];
  input: string;
  currentProcessingStep: string;
  currentSearchResults: SearchResult[];
  searchEnabled: boolean;
  reasoningEnabled: boolean;
  chatHistory: { role: string; content: string }[];
}

// Define the actions that can modify the chat state
interface ChatActions {
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setInput: (input: string) => void;
  setCurrentProcessingStep: (currentProcessingStep: string) => void;
  setCurrentSearchResults: (results: SearchResult[]) => void;
  setChatHistory: (
    history: { role: string; content: string }[] | ((prev: any[]) => any[])
  ) => void;
}

// Helper function to extract domain from URL
function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain.split(".")[0];
  } catch {
    return "";
  }
}

console.log("chatSubmitHandler re-rendered");

// Main function to handle chat form submissions
export async function handleRawUserInput(
  e: React.FormEvent,
  state: ChatState,
  actions: ChatActions
) {
  actions.setCurrentProcessingStep("Understanding User Input");

  // Prevent form default behavior and validate input
  e.preventDefault();
  if (!state.input.trim()) return;

  // Get user message and clear input field
  const userMessage = state.input.trim();
  actions.setInput("");

  // Add user message to chat history
  actions.setMessages((prev) => [
    ...prev,
    {
      index: Date.now(),
      role: "user",
      content: userMessage,
    },
  ]);

  try {
    let contextualizedInput = userMessage;
    let searchContext = {
      results: [] as SearchResult[],
      extractedContent: "",
      refinedQuery: userMessage,
    };

    // If search is enabled, perform search operations
    if (state.searchEnabled) {
      // console.log("Search Phase - Starting - Refining User Input", {});

      actions.setCurrentProcessingStep("Refining Search Query");

      console.log("Current Processing Step:", state.currentProcessingStep);

      const searchParameters = {
        name: "search_parameters",
        schema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The search query or question you want to ask. This is the primary input for your search. Be as specific as possible in your query.",
            },
            date_context: {
              type: "string",
              description: "Optional date for context.",
            },
            location: {
              type: "string",
              description:
                "Country code for search context. This helps in providing localized results.",
            },
            pro_mode: {
              type: "boolean",
              description:
                "Enable or disable pro mode for more advanced search capabilities.",
            },
            response_language: {
              type: "string",
              description:
                "Language code for the response. 'auto' will auto-detect based on the query.",
            },
            answer_type: {
              type: "string",
              description:
                "Format of the answer. Options: 'text', 'markdown', or 'html'.",
            },
            search_type: {
              type: "string",
              description: "Type of the search: general or news.",
            },
            verbose_mode: {
              type: "boolean",
              description:
                "Set verbose_mode parameter to True to get more detailed information in the response.",
            },
            return_citations: {
              type: "boolean",
              description: "Include citations in the response.",
            },
            return_sources: {
              type: "boolean",
              description: "Return sources.",
            },
            return_images: {
              type: "boolean",
              description:
                "Return images if provided in the response (depends on the search query and the google API).",
            },
            recency_filter: {
              type: "string",
              description:
                "Can be hour, day, week, month, year, anytime. Impacts the search results recency.",
            },
          },
          required: [
            "query",
            "date_context",
            "location",
            "pro_mode",
            "response_language",
            "answer_type",
            "search_type",
            "verbose_mode",
            "return_citations",
            "return_sources",
            "return_images",
            "recency_filter",
          ],
          additionalProperties: false,
        },
        strict: true,
      };

      // Before making the OpenAI API call

      console.log("=== Starting Query Refinement ===");
      console.log("User Query:", userMessage);

      const response = await fetch("/api/OpenAI/SearchQueryRefinement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a specialized LLM that refines user queries to maximize search result quality.

Your task is to analyze the user's query and provide refined search parameters. These parameters will be used to optimize search results. The parameters you should focus on are:

- system_prompt: The system prompt is the prompt that will be used to generate the response.
- user_prompt: The user prompt is the prompt that will be used to perform the web search. Be as specific as possible and let the system prompt handle the details of the response.
- location: Country code for search context. This helps in providing localized results.
- pro_mode: Enable or disable pro mode for more advanced search capabilities.
- search_type: Type of the search: general or news.
- temperature: The amount of randomness in the response, valued between 0 inclusive and 1 exclusive. Higher values are more random, and lower values are more deterministic.
- top_p: The nucleus sampling threshold, valued between 0 and 1 inclusive.
- return_sources: Return Sources
- return_images: Return Images
- recency_filter: Can be hour, day, week, month, year, anytime. Impact the search results recency.

The current day is  and date is ${
                new Date().toISOString().split("T")[0]
              } and the current time is ${
                new Date().toISOString().split("T")[1].split(".")[0]
              }. Please use this date and time to get the most up-to-date results.

Consider the chat history for context:
${JSON.stringify(state.chatHistory)}

Provide your response as a JSON object with the refined query and all applicable search parameters.

Your response must be a valid JSON object with this schema:
${JSON.stringify(searchParameters, null, 2)}

Return only the JSON object, no other text.`,
            },
            { role: "user", content: userMessage },
          ],
          reasoningEnabled: state.reasoningEnabled,
          currentProcessingStep: state.currentProcessingStep,
          response_format: searchParameters,
        }),
      });

      console.log("Query Refinement - Completed");

      actions.setCurrentProcessingStep("Completed Refining Search Query");

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      let refinedsearchdata;

      try {
        refinedsearchdata = await response.json();
        console.log("Parsed search parameters:", refinedsearchdata);
      } catch (error) {
        console.error("Parse Error:", error);
        // Use fallback data
        refinedsearchdata = {
          query: userMessage,
          date_context: `The current date is ${
            new Date().toISOString().split("T")[0]
          } and the current time is ${
            new Date().toISOString().split("T")[1].split(".")[0]
          }`,
          location: "in",
          pro_mode: false,
          response_language: "en",
          answer_type: "text",
          search_type: "general",
          verbose_mode: false,
          return_citations: true,
          return_sources: true,
          return_images: false,
          recency_filter: "last 24 hours",
        };
      }

      // Start search process
      actions.setCurrentProcessingStep("Searching");
      actions.setCurrentSearchResults([]);
      console.log(
        "setting current processing step to searching 1st time",
        state.currentProcessingStep
      );

      // Add placeholder message for search results
      actions.setMessages((prev) => [
        ...prev,
        {
          index: Date.now(),
          role: "assistant",
          content: "",
          searchResults: [],
        },
      ]);

      // console.log("OpenPerplex Search - Starting", { query: searchContext.refinedQuery, options: refinedsearchdata.searchOptions, });
      actions.setCurrentProcessingStep("Searching");

      console.log(
        "Processing Step to initiate search 2nd time",
        state.currentProcessingStep
      );

      try {
        const response = await fetch(`/api/OpenPerplex/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.OPENPERPLEX_API_KEY || "",
          },
          body: JSON.stringify(refinedsearchdata),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const searchData = await response.json();

        console.log("searchData", searchData);

        // Use the OpenPerplex response format
        searchContext.results = searchData.sources || [];
        console.log("searchContext.results", searchContext.results);
        console.log(
          "searchContext.results as string",
          JSON.stringify(searchContext.results)
        );
        searchContext.extractedContent = searchData.llm_response || "";

        if (searchData.error) {
          throw new Error(searchData.error);
        }
        actions.setCurrentSearchResults(searchContext.results);
        actions.setCurrentProcessingStep("Completed Searching");
      } catch (error) {
        console.error("Search failed:", error);
        actions.setCurrentProcessingStep("Search failed");
      }

      // Update messages with search results
      actions.setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          if (searchContext.results.length > 0) {
            lastMessage.additionalInfo = {
              externalLinks: searchContext.results,
            };
          } else {
            lastMessage.content = "no-results";
            lastMessage.additionalInfo = { externalLinks: [] };
          }
        }
        return newMessages;
      });

      actions.setCurrentProcessingStep("Formatting Search Results");

      contextualizedInput = `Synthesize the following search results and extracted content to answer the user's question "${userMessage}". Keep as much of the original content as possible.

Search Results:
${JSON.stringify(searchContext.results)}

Extracted Content:
${searchContext.extractedContent} please cite the sources in the response.`;
    }

    if (state.searchEnabled) {
      //console.log("Final Response - Starting");
      actions.setCurrentProcessingStep("Final Response");
      //console.log("final input", contextualizedInput);
    } else {
      //console.log("Model Response - Starting");
      actions.setCurrentProcessingStep("Model Response");
      console.log("Current Processing Step:", state.currentProcessingStep);
    }

    const finalResponse = await fetch("/api/OpenAI/Chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          systemMessage,
          ...state.chatHistory
            .filter((msg) => msg.role !== "system")
            .reduce((acc: any[], msg, index, array) => {
              acc.push(msg);
              if (
                msg.role === "user" &&
                index < array.length - 1 &&
                array[index + 1].role !== "assistant"
              ) {
                acc.push({ role: "assistant", content: "Acknowledged." });
              }
              return acc;
            }, []),
          { role: "user", content: contextualizedInput },
        ],
      }),
    });

    if (!finalResponse.ok) {
      // Log detailed error information
      const errorText = await finalResponse.text();
      console.error("Final Chat API Error Details:", {
        status: finalResponse.status,
        statusText: finalResponse.statusText,
        error: errorText,
      });

      // Add an error message to the chat
      actions.setMessages((prev) => [
        ...prev,
        {
          index: Date.now(),
          role: "assistant",
          content:
            "I apologize, but I encountered an error while processing your request. Please try again.",
        },
      ]);

      // Update chat history to reflect the error
      actions.setChatHistory((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        {
          role: "assistant",
          content: "Error: Unable to process request",
        },
      ]);

      throw new Error(
        `Failed to get response (${finalResponse.status}): ${errorText}`
      );
    }

    // Add initial assistant message
    actions.setMessages((prev) => [
      ...prev,
      {
        index: Date.now(),
        role: "assistant",
        content: "",
      },
    ]);

    const reader = finalResponse.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let content = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          actions.setCurrentProcessingStep("");
          break;
        }

        // Decode chunk and clean it
        const chunk = decoder.decode(value, { stream: true });

        //let count = 1;count++;console.log("chunk number", count);console.log("chunk", chunk);//logs to understand how things work behind the scenes

        // Clean the chunk and append to content
        const cleanChunk = chunk;
        if (cleanChunk.trim()) {
          content += cleanChunk;
          //console.log("content", content);
          // Update message with accumulated content
          actions.setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === "assistant") {
              lastMessage.content = content;
            }
            return newMessages;
          });
        }
      }
    } catch (streamError) {
      console.error("Stream error:", streamError);
      //update the last message to show the error
      actions.setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage?.role === "assistant") {
          lastMessage.content =
            "Error: Failed to process the streaming response. Please try again.";
        }
        return newMessages;
      });
      throw streamError;
    } finally {
      reader.releaseLock();
    }

    // Update chat history with final exchange
    actions.setChatHistory((prev) => {
      const newHistory = [...prev];

      // Always add the initial user message
      newHistory.push({ role: "user", content: userMessage });

      if (state.searchEnabled && searchContext.results) {
        // Add search-related information as a single assistant message
        newHistory.push({
          role: "assistant",
          content: `Search Results Summary:
- Refined query: "${searchContext.refinedQuery}"
- Found ${searchContext.results.length} results
${
  searchContext.results.length > 0
    ? `- Top result: "${searchContext.results[0].title}"`
    : "- No relevant results found"
}`,
        });

        // Add the contextualized input as a user message
        newHistory.push({
          role: "user",
          content: contextualizedInput,
        });
      }

      // Add the assistant's final response
      newHistory.push({
        role: "assistant",
        content,
        ...(state.reasoningEnabled && { reasoning: true }),
      });

      return newHistory;
    });
  } catch (error) {
    console.error("Chat Submit Handler - Error:", error);
    actions.setCurrentProcessingStep("");
    actions.setMessages((prev) => [
      ...prev,
      {
        index: Date.now(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again.",
        searchResults: [],
      },
    ]);
  }
}
