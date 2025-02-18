import { OpenPerplexSearchParametersFormat, Message } from "./type";

const OpenPerplexSearchParametersSchema: OpenPerplexSearchParametersFormat = {
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

export const systemMessage: Message = {
  role: "system",
  content:
    "You are a helpful assistant that provides clear, focused responses. For factual questions, you give direct answers. For complex topics, you break down explanations into clear sections. You use simple language and note any uncertainties.",
};

export const QueryRefinementPrompt = {
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

Provide your response as a JSON object (no other text) with the refined query and all applicable search parameters.

The current day is  and date is ${
    new Date().toISOString().split("T")[0]
  } and the current time is ${
    new Date().toISOString().split("T")[1].split(".")[0]
  }. Please use this date and time to get the most up-to-date results.

            Your response must be a valid JSON object with this schema: ${JSON.stringify(
              OpenPerplexSearchParametersSchema,
              null,
              2
            )}
`,
};

export const contextualisedInputPromptAfterSearch =
  "Synthesis the search results and extracted content attached below to answer the user's initial question promptly. Keep as much of the original content as possible.";
//Serach Parameters for OpenPerplex Search
export const searchParameters = OpenPerplexSearchParametersSchema;
