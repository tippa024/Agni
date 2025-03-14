import { Dispatch, SetStateAction } from "react";

export interface ChatInputProps {
  input: string;
  userPreferences: UserPreferences;
  font: { className: string };
  handleSubmit: (e: React.FormEvent) => void;
  setInput: Dispatch<SetStateAction<string>>;
  setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
}

export type UserPreferences =
  | {
      searchEnabled: true;
      searchProvider: "OpenPerplex";
      model:
        | ["gpt-4o-mini", "OpenAI"]
        | ["claude-3-5-haiku-20241022", "Anthropic"]
        | ["gpt-4o", "OpenAI"]
        | ["claude-3-5-sonnet-20241022", "Anthropic"];
    }
  | {
      searchEnabled: false;
      searchProvider?: never;
      model:
        | ["gpt-4o-mini", "OpenAI"]
        | ["claude-3-5-haiku-20241022", "Anthropic"]
        | ["gpt-4o", "OpenAI"]
        | ["claude-3-5-sonnet-20241022", "Anthropic"];
    };

export type conversationHistory =
  | {
      role: "system";
      content: string;
      timestamp: string;
    }
  | {
      role: "user";
      content: string;
      timestamp: string;
      location: { latitude: number; longitude: number };
      userPreferences: UserPreferences;
    }
  | {
      role: "assistant";
      content: string;
      model: string;
      modelProvider: string;
      timestamp: string;
    }
  | {
      role: "developer";
      content: string;
      timestamp: string;
    };

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResult[];
  additionalInfo?: string;
}

export interface ChatState {
  input: string;
  messages: Message[];
  userPreferences: UserPreferences;
  currentProcessingStep: string;
  conversationHistory: conversationHistory[];
  context: boolean;
  location: { latitude: number; longitude: number };
}

export interface ChatActions {
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setInput: (input: string) => void;
  setCurrentProcessingStep: (currentProcessingStep: string) => void;
  setConversationHistory: (
    history:
      | conversationHistory[]
      | ((prev: conversationHistory[]) => conversationHistory[])
  ) => void;
  setLocation: (
    location: { latitude: number; longitude: number } | null
  ) => void;
}

export interface MessageBubbleProps {
  message: Message;
  messageComponentIndex: number;
  currentProcessingStep?: string;
  userPreferences?: UserPreferences;
}

///###  OPENPERPLEXAPI  #########################################################

//////////////////////Search//////////////////////
export interface OpenPerplexSearchParametersFormat {
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

export interface SearchParameters {
  query: string;
  date_context: string;
  location: string;
  model: string;
  response_language: string;
  answer_type: string;
  search_type: string;
  return_citations: boolean;
  return_sources: boolean;
  return_images: boolean;
  recency_filter: string;
}

export interface SearchOutput {
  sources: SearchResult[];
  llm_response: string;
  responsetime: number;
  error?: string;
}

//////////////////////Custom Search//////////////////////
export interface OpenPerplexCustomSearchFormat {
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

export interface CustomSearchParameters {
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

export interface CustomSearchOutput {
  sources: SearchResult[];
  llm_response: string;
  responsetime: number;
  error?: string;
}

//////////////////////GET URL TEXT, Markdown, HTML//////////////////////

export interface OpenPerplexULRGetMethodFormat {
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

export interface URLParameters {
  url: string;
}

export interface GetURLOutput {
  text?: string;
  markdown?: string;
  html?: string;
  responsetime: number;
  error?: string;
}

//////////////////////URL Query//////////////////////

export interface OpenPerplexQueryFromURLFormat {
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

export interface URLspecificQueryParameters {
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
