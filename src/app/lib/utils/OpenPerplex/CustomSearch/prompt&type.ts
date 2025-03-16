import { OpenPerplexSearchResult } from "../Search/prompt&type";

export interface OpenPerplexCustomSearchSchemaFormat {
  name: string;
  schema: {
    type: string;
    properties: {
      system_prompt: {
        type: string;
        description: string;
      };
      user_prompt: {
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
      search_type: {
        type: string;
        description: string;
      };
      temperature: {
        type: string;
        description: string;
      };
      top_p: {
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
      string
    ];
    additionalProperties: boolean;
  };
  strict: boolean;
}

export interface OpenPerplexCustomSearchParameters {
  system_prompt: string;
  user_prompt: string;
  location: string;
  model: string;
  search_type: string;
  temperature: number;
  top_p: number;
  return_sources: boolean;
  return_images: boolean;
  recency_filter: string;
}

export interface OpenPerplexCustomSearchOutput {
  sources: OpenPerplexSearchResult[];
  llm_response: string;
  responsetime: number;
  error?: string;
}

export const OpenPerplexCustomSearchParametersSchema: OpenPerplexCustomSearchSchemaFormat =
  {
    name: "custom_search_parameters",
    schema: {
      type: "object",
      properties: {
        system_prompt: {
          type: "string",
          description:
            "The system prompt will be used to generate the response",
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
