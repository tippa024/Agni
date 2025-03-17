export interface OpenPerplexQueryFromURLSchemaFormatForOpenAI {
  name: string;
  schema: {
    type: string;
    properties: {
      url: {
        type: string;
        description: string;
      };
      query: {
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
    };
    required: [string, string, string, string, string];
    additionalProperties: boolean;
  };
  strict: boolean;
}

export interface OpenPerplexURLspecificQueryParameters {
  query: string;
  model: string;
  response_language: string;
  answer_type: string;
}

export interface URLspecificQueryOutput {
  llm_response: string;
  responsetime: number;
  error?: string;
}

export const OpenPerplexURLSpecificQueryParametersSchemaForOpenAI: OpenPerplexQueryFromURLSchemaFormatForOpenAI =
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
