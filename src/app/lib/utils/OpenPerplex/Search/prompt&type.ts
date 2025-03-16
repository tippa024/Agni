export interface OpenPerplexSearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface OpenPerplexSearchParametersSchemaFormat {
  name: string;
  schema: {
    type: string;
    properties: {
      query: {
        type: string;
        description: string;
      };
      date_context: {
        type: string;
        description: string;
      };
      location: {
        type: string;
        description: string;
      };
      model: {
        type: string;
        description: string;
      };
      response_language: {
        type: string;
        description: string;
      };
      answer_type: {
        type: string;
        description: string;
      };
      search_type: {
        type: string;
        description: string;
      };
      return_citations: {
        type: string;
        description: string;
      };
      return_sources: {
        type: string;
        description: string;
      };
      return_images: {
        type: string;
        description: string;
      };
      recency_filter: {
        type: string;
        description: string;
      };
    };
    required: [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string
    ];
    additionalProperties: boolean;
  };
  strict: boolean;
}

export interface OpenPerplexSearchParameters {
  query: string;
  date_context?: string;
  location?: string;
  model?: string;
  response_language?: string;
  answer_type?: string;
  search_type?: string;
  return_citations?: boolean;
  return_sources?: boolean;
  return_images?: boolean;
  recency_filter?: string;
}

export interface OpenPerplexSearchOutput {
  sources: OpenPerplexSearchResult[];
  llm_response: string;
  responsetime: number;
  error?: string;
}

export const OpenPerplexSearchParametersSchema: OpenPerplexSearchParametersSchemaFormat =
  {
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

export const OpenPerplexSearchQueryRefinementPrompt = {
  role: "system",
  content: `You are a specialized agent that refines user queries to maximize search result quality. The current day, date and time is ${new Date().toLocaleString()}.
  
  Your task is to analyze the user's query and provide the most optimal search parameters. The parameters are as follows:
  
  query: ${
    OpenPerplexSearchParametersSchema.schema.properties.query.description
  }
  date_context: ${
    OpenPerplexSearchParametersSchema.schema.properties.date_context.description
  }
  location: ${
    OpenPerplexSearchParametersSchema.schema.properties.location.description
  }
  model: ${
    OpenPerplexSearchParametersSchema.schema.properties.model.description
  }
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
