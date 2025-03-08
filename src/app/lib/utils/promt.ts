import {
  OpenPerplexSearchParametersFormat,
  OpenPerplexULRGetMethodFormat,
  OpenPerplexQueryFromURLFormat,
  Message,
  OpenPerplexCustomSearchFormat,
} from "./type";

const today = new Date();

export const systemMessage: Message = {
  role: "system",
  content: `You are AGNI, a helpful assistant that provides clear, focused responses. Inspired by the fire element known for its power to purify and transform, you are focused on helping the user really understand their curiosity, purify their intent by cutting through the noise/doubt/vagueness, and internalise their learnings from first principles. 
  To do this, you do not spoon feed the user, but rather nudge them to help them uncover their curiosity from simplest of questions to the most complex ones. You are equally curious to know the intent behind the question, and the context in which the question is asked. If the user asks a sloppy question, you refusre to answer it until the user clarifies their intent clearly.
  For factual questions, you give direct answers. 
  For complex topics, you ask thoughful questions to uncover/clarify the intent, and then you break down explanations into clear sections. 
  You use simple and straight forward language and note any uncertainties. If you are refereing to an information for a specific source, then please hyperlink it in your response. 
  For context, Today's date is ${today}`,
};

export const ChatSessionToMarkDownPrompt: Message = {
  role: "system",
  content: `You are a helpful assistant that converts a chat session into a markdown format. You note the user's intent, the context in which the question is asked, and the sources used to answer the question and then you convert the chat session into a markdown format. You keep whats essential to the user's question and the answer, and discard the rest. The PoV is to understand the user's intent and the context in which the question is asked. The chat session is as follows:
  `,
};

const OpenPerplexSearchParametersSchema: OpenPerplexSearchParametersFormat = {
  name: "search_parameters",
  schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The search query or question you want to ask. This is the primary input for your search. Be as specific as possible in your query. If needed, string together multiple queries to get a more comprehensive answer.",
      },
      date_context: {
        type: "string",
        description:
          "Optional date for context, this is to ensure our results are the most upto date. For some queries (example in case of a historical event)having the current date as the context may not be the best option. In such cases it would be ideal to highlight both, the current date and the date of the event to get the most optimal result",
      },
      location: {
        type: "string",
        description:
          "Country code for search context. This helps in providing localized results. defaults to 'us'(United States). Though I am based in India ('in'), I tend to seach for a lot of US centric things. So keep this in mind and pick the most appropriate location based on what I am looking for. Supported regions are  'in'(India), 'us'(United States), 'ca'(Canada), 'uk'(United Kingdom), 'mx'(Mexico), 'es'(Spain), 'de'(Germany), 'fr'(France), 'pt'(Portugal), 'be'(Belgium), 'nl'(Netherlands), 'ch'(Switzerland), 'no'(Norway), 'se'(Sweden), 'at'(Austria), 'dk'(Denmark), 'fi'(Finland), 'tr'(Turkey), 'it'(Italy), 'pl'(Poland), 'ru'(Russia), 'za'(South Africa), 'ae'(United Arab Emirates), 'sa'(Saudi Arabia), 'ar'(Argentina), 'br'(Brazil), 'au'(Australia), 'cn'(China), 'kr'(South Korea), 'jp'(Japan), 'ps'(Palestine), 'kw'(Kuwait), 'om'(Oman), 'qa'(Qatar), 'il'(Israel), 'ma'(Morocco), 'eg'(Egypt), 'ir'(Iran), 'ly'(Libya), 'ye'(Yemen), 'id'(Indonesia), 'pk'(Pakistan), 'bd'(Bangladesh), 'my'(Malaysia), 'ph'(Philippines), 'th'(Thailand), 'vn'(Vietnam)",
      },
      model: {
        type: "string",
        description: "defaults to 'gpt-4o-mini'. keep it to that",
      },
      response_language: {
        type: "string",
        description:
          "Language code for the response. 'auto' will auto-detect based on the query. defaults to 'auto'. Supported languages are 'en' (English), 'fr' (French), 'es' (Spanish), 'de' (German), 'it' (Italian), 'pt' (Portuguese), 'nl' (Dutch), 'ja' (Japanese), 'ko' (Korean), 'zh' (Chinese), 'ar' (Arabic), 'ru' (Russian), 'tr' (Turkish), 'hi' (Hindi)",
      },
      answer_type: {
        type: "string",
        description:
          "Format of the answer. Options: 'text', 'markdown', or 'html'. defaults to 'text'",
      },
      search_type: {
        type: "string",
        description: " general or news. defautls to 'general'",
      },
      return_citations: {
        type: "boolean",
        description: "Include citations in the response. defaults to false",
      },
      return_sources: {
        type: "boolean",
        description:
          "Return sources. defaults to false but I want it to be true",
      },
      return_images: {
        type: "boolean",
        description:
          "Return images if provided in the response (depends on the search query and the google API). defaults to false",
      },
      recency_filter: {
        type: "string",
        description:
          "Can be hour, day, week, month, year, anytime. Impacts the search results recency. defaults to 'anytime'",
      },
    },
    required: [
      "query",
      "date_context",
      "location",
      "model",
      "response_language",
      "answer_type",
      "search_type",
      "return_citations",
      "return_sources",
      "return_images",
      "recency_filter",
    ],
    additionalProperties: false,
  },
  strict: true,
};

export const SearchQueryPrompt = {
  role: "system",
  content: `You are a specialized agent that refines user queries to maximize search result quality. The current day, date and time is ${today}.

Your task is to analyze the user's query and provide the most optimal search parameters. The parameters are as follows:

query: ${OpenPerplexSearchParametersSchema.schema.properties.query.description}
date_context: ${
    OpenPerplexSearchParametersSchema.schema.properties.date_context.description
  }
location: ${
    OpenPerplexSearchParametersSchema.schema.properties.location.description
  }
model: ${OpenPerplexSearchParametersSchema.schema.properties.model.description}
response_language: ${
    OpenPerplexSearchParametersSchema.schema.properties.response_language
      .description
  }
answer_type: ${
    OpenPerplexSearchParametersSchema.schema.properties.answer_type.description
  }
search_type: ${
    OpenPerplexSearchParametersSchema.schema.properties.search_type.description
  }
return_citations: ${
    OpenPerplexSearchParametersSchema.schema.properties.return_citations
      .description
  }
return_sources: ${
    OpenPerplexSearchParametersSchema.schema.properties.return_sources
      .description
  }
return_images: ${
    OpenPerplexSearchParametersSchema.schema.properties.return_images
      .description
  }
recency_filter: ${
    OpenPerplexSearchParametersSchema.schema.properties.recency_filter
      .description
  }

Your response must be a valid JSON object with this schema: ${JSON.stringify(
    OpenPerplexSearchParametersSchema,
    null,
    2
  )}

Provide your response as a JSON object (no other text) with the refined query and all applicable search parameters.`,
};

export const searchParametersSchema = OpenPerplexSearchParametersSchema;

const OpenPerplexCustomSearchParametersSchema: OpenPerplexCustomSearchFormat = {
  name: "custom_search_parameters",
  schema: {
    type: "object",
    properties: {
      system_prompt: {
        type: "string",
        description: "The system prompt will be used to generate the response",
      },
      user_prompt: {
        type: "string",
        description:
          "The user prompt is the pormt that will be used to perform the web search. Be as specific as possible in your query. If needed, string together multiple queries to get a more comprehensive answer. Let the system prompt handle the deaitls of the response",
      },
      location: {
        type: "string",
        description:
          "The location for the custom search. defaults to 'us'(United States). Though I am based in India ('in'), I tend to seach for a lot of US centric things. So keep this in mind and pick the most appropriate location based on what I am looking for. Supported regions are  'in'(India), 'us'(United States), 'ca'(Canada), 'uk'(United Kingdom), 'mx'(Mexico), 'es'(Spain), 'de'(Germany), 'fr'(France), 'pt'(Portugal), 'be'(Belgium), 'nl'(Netherlands), 'ch'(Switzerland), 'no'(Norway), 'se'(Sweden), 'at'(Austria), 'dk'(Denmark), 'fi'(Finland), 'tr'(Turkey), 'it'(Italy), 'pl'(Poland), 'ru'(Russia), 'za'(South Africa), 'ae'(United Arab Emirates), 'sa'(Saudi Arabia), 'ar'(Argentina), 'br'(Brazil), 'au'(Australia), 'cn'(China), 'kr'(South Korea), 'jp'(Japan), 'ps'(Palestine), 'kw'(Kuwait), 'om'(Oman), 'qa'(Qatar), 'il'(Israel), 'ma'(Morocco), 'eg'(Egypt), 'ir'(Iran), 'ly'(Libya), 'ye'(Yemen), 'id'(Indonesia), 'pk'(Pakistan), 'bd'(Bangladesh), 'my'(Malaysia), 'ph'(Philippines), 'th'(Thailand), 'vn'(Vietnam)",
      },
      model: {
        type: "string",
        description:
          "The model for the custom search. defaults to 'gpt-4o-mini'",
      },
      search_type: {
        type: "string",
        description:
          "The search type for the custom search. defaults to 'general'",
      },
      temperature: {
        type: "number",
        description:
          "The amount of randomness in the response, valued between 0 (inclusive) and 1 (exclusive) Higher values are more random, and lower values are more deterministic. defaults to 0.2",
      },
      top_p: {
        type: "number",
        description:
          "The nucleus sampling threshold, valued between 0 and 1 inclusive. For each subsequent token, the model consideres the resutls fo the tokkens with top_p probability mass. Pick either top_p or temperature (based on what might give a better result), not both. defaults to 0.9",
      },
      return_sources: {
        type: "boolean",
        description: "Return sources. defaults to false",
      },
      return_images: {
        type: "boolean",
        description: "Return images. defaults to false",
      },
      recency_filter: {
        type: "string",
        description: "The recency filter for the custom search.",
      },
    },
    required: [
      "system_prompt",
      "user_prompt",
      "location",
      "model",
      "search_type",
      "temperature",
      "top_p",
      "return_sources",
      "return_images",
      "recency_filter",
    ],
    additionalProperties: false,
  },
  strict: true,
};

const OpenPerplexURLGetMethodParametersSchema: OpenPerplexULRGetMethodFormat = {
  name: "url_get_method_parameters",
  schema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL to get the content from",
      },
    },
    required: ["url"],
    additionalProperties: false,
  },
  strict: true,
};

const OpenPerplexURLSpecificQueryParametersSchema: OpenPerplexQueryFromURLFormat =
  {
    name: "url_specific_query_parameters",
    schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to get the content from",
        },
        query: {
          type: "string",
          description: "The query to get the content from",
        },
        model: {
          type: "string",
          description:
            "The model to use for the query, defaults to 'gpt-4o-mini', lets keep it to that",
        },
        response_language: {
          type: "string",
          description:
            "The response language for the query, defaults to 'auto'",
        },
        answer_type: {
          type: "string",
          description: "The answer type for the query, defaults to 'text'",
        },
      },
      required: ["url", "query", "model", "response_language", "answer_type"],
      additionalProperties: false,
    },
    strict: true,
  };

export const contextualisedInputPromptAfterSearch =
  "Synthesis the search results and extracted content attached below to answer the user's initial question promptly. Keep as much of the original content as possible.";

//Serach Parameters for OpenPerplex Search

export const customSearchParametersSchema =
  OpenPerplexCustomSearchParametersSchema;
export const urlGetMethodParametersSchema =
  OpenPerplexURLGetMethodParametersSchema;
export const urlSpecificQueryParametersSchema =
  OpenPerplexURLSpecificQueryParametersSchema;
