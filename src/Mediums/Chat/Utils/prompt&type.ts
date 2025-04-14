import { Dispatch, SetStateAction } from "react";
import { openaiModelDetails } from "@/Models/OpenAI/modeldetails";
import { anthropicModelDetails } from "@/Models/Anthropic/modeldetails";

export interface ChatInputProps {
  input: string;
  userPreferences: UserPreferences;
  font: { className: string };
  onSubmit: (e: React.FormEvent) => void;
  setInput: (input: string) => void;
  setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
}

export interface pricing {
  input: number;
  cachewrite: number | null;
  cacheread: number | null;
  output: number;
}

export interface modeloptionsforprovider {
  name: string;
  apiCallName: string;
  reasoning: boolean;
  pricing: pricing;
}

export interface supportedModels extends modeloptionsforprovider {
  provider: string;
}

export function getSupportedModels(): supportedModels[] {
  const openaiModels: supportedModels[] = openaiModelDetails.map((model) => ({
    provider: "OpenAI",
    name: model.name,
    apiCallName: model.apiCallName,
    pricing: model.pricing,
    reasoning: model.reasoning,
  }));

  const anthropicModels: supportedModels[] = anthropicModelDetails.map(
    (model) => ({
      provider: "Anthropic",
      name: model.name,
      apiCallName: model.apiCallName,
      pricing: model.pricing,
      reasoning: model.reasoning,
    })
  );

  return [...openaiModels, ...anthropicModels];
}

export type UserPreferences =
  | {
      searchEnabled: true;
      context: boolean;
      searchProvider: "OpenPerplex";
      model: supportedModels;
    }
  | {
      searchEnabled: false;
      context: boolean;
      model: supportedModels;
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

export type conversation =
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
      context?: {
        reasoning: string;
        sources: SearchResult[];
      };
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
}

export const systemMessage: Message = {
  role: "system",
  content: `You are AGNI, a helpful assistant that provides clear, focused responses. Inspired by the fire element known for its power to purify and transform, you help users understand their curiosity, clarify their intent, and internalize learnings from first principles.

You don't spoon-feed users but guide them to uncover their curiosity from simple to complex questions. You seek to understand the intent and context behind questions. If a question is unclear, you ask for clarification while taking the context into account.

For factual questions, you provide direct answers.
For complex topics, you ask thoughtful questions to clarify intent (if not clear from the question or context), then break down explanations into clear sections.

You use simple, straightforward, jargon-free, and precise language and acknowledge uncertainties. When referencing specific information sources, you include hyperlinks.

For context, today's date is ${new Date().toLocaleDateString()}

When you have additional context (when the user has enabled context), occasionally test the user's knowledge by asking them random questions about a random topic from the context. These questions should be conceptual rather than factual, helping users clarify their intent and deepen their understanding.

If users are struggling, guide them toward the answer while encouraging them to think for themselves. The goal is to help users learn and develop their own insights rather than simply providing information.`,
  timestamp:
    new Date().toLocaleDateString("en-GB") +
    " " +
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
};
