import { Dispatch, SetStateAction } from "react";

export interface ChatInputProps {
  input: string;
  userPreferences: UserPreferences;
  font: { className: string };
  handleSubmit: (e: React.FormEvent) => void;
  setInput: Dispatch<SetStateAction<string>>;
  setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
}

export interface UserPreferences {
  searchEnabled: boolean;
  model:
    | ["gpt-4o-mini", "OpenAI"]
    | ["claude-3-5-haiku", "Anthropic"]
    | ["gpt-4o", "OpenAI"]
    | ["claude-3-5-sonnet", "Anthropic"]
    | ["o3-mini", "OpenAI"]
    | ["deepseek-r1", "DeepSeek"]
    | ["deepseek-v3", "DeepSeek"];
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  sources?: SearchResult[];
  additionalInfo?: string;
}

export interface ChatState {
  input: string;
  messages: Message[];
  userPreferences: UserPreferences;
  currentProcessingStep: string;
  conversationHistory: { role: string; content: string }[];
}

// Define the actions that can modify the chat state
export interface ChatActions {
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setInput: (input: string) => void;
  setCurrentProcessingStep: (currentProcessingStep: string) => void;
  setConversationHistory: (
    history: { role: string; content: string }[] | ((prev: any[]) => any[])
  ) => void;
}

export interface MessageBubbleProps {
  message: Message;
  messageComponentIndex: number;
  currentProcessingStep?: string;
  userPreferences?: UserPreferences;
}

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
      pro_mode: {
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
      verbose_mode: {
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
  pro_mode: boolean;
  response_language: string;
  answer_type: string;
  search_type: string;
  verbose_mode: boolean;
  return_citations: boolean;
  return_sources: boolean;
  return_images: boolean;
  recency_filter: string;
}
