export interface OpenPerplexURLGetMethodSchemaFormatForOpenAI {
  name: string;
  schema: {
    type: string;
    properties: {
      url: {
        type: string;
        description: string;
      };
    };
    required: [string];
    additionalProperties: boolean;
  };
  strict: boolean;
}

export interface OpenPerplexURLParameters {
  url: string;
}

export interface OpenPerplexGetURLOutput {
  text?: string;
  markdown?: string;
  html?: string;
  responsetime: number;
  error?: string;
}

export const OpenPerplexURLGetMethodParametersSchemaForOpenAI: OpenPerplexURLGetMethodSchemaFormatForOpenAI =
  {
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
