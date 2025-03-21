import { Dispatch, SetStateAction } from "react";

export interface ChatInputProps {
  input: string;
  userPreferences: UserPreferences;
  font: { className: string };
  handleSubmit: (e: React.FormEvent) => void;
  setInput: (input: string) => void;
  setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
}

export type UserPreferences =
  | {
      searchEnabled: true;
      context: boolean;
      searchProvider: "OpenPerplex";
      model:
        | ["gpt-4o-mini", "OpenAI"]
        | ["claude-3-5-haiku-20241022", "Anthropic"]
        | ["gpt-4o", "OpenAI"]
        | ["claude-3-5-sonnet-20241022", "Anthropic"];
    }
  | {
      searchEnabled: false;
      context: boolean;
      model:
        | ["gpt-4o-mini", "OpenAI"]
        | ["claude-3-5-haiku-20241022", "Anthropic"]
        | ["gpt-4o", "OpenAI"]
        | ["claude-3-5-sonnet-20241022", "Anthropic"];
    };

export interface ChatState {
  input: string;
  messages: Message[];
  userPreferences: UserPreferences;
  currentProcessingStep: string;
  conversationHistory: conversationHistory[];
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
  setUserPreferences: (
    userPreferences:
      | UserPreferences
      | ((prev: UserPreferences) => UserPreferences)
  ) => void;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  sources?: SearchResult[];
  additionalInfo?: string;
}

export interface SearchResult {
  title?: string;
  link: string;
  snippet?: string;
}

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

export interface MessageBubbleProps {
  message: Message;
  messageComponentIndex: number;
  currentProcessingStep?: string;
  userPreferences?: UserPreferences;
}

export const systemMessage: Message = {
  role: "system",
  content: `You are AGNI, a helpful assistant that provides clear, focused responses. Inspired by the fire element known for its power to purify and transform, you are focused on helping the user really understand their curiosity, purify their intent by cutting through the noise/doubt/vagueness, and internalise their learnings from first principles. 
    To do this, you do not spoon feed the user, but rather nudge them to help them uncover their curiosity from simplest of questions to the most complex ones. You are equally curious to know the intent behind the question, and the context in which the question is asked. If the user asks a sloppy question, you refusre to answer it until the user clarifies their intent clearly.
    For factual questions, you give direct answers. 
    For complex topics, you ask thoughful questions to uncover/clarify the intent, and then you break down explanations into clear sections. 
    You use simple and straight forward language and note any uncertainties. If you are refereing to an information for a specific source, then please hyperlink it in your response. 
    For context, Today's date is ${new Date().toLocaleDateString()}`,
  timestamp:
    new Date().toLocaleDateString("en-GB") +
    " " +
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
};
