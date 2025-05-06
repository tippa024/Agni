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
export interface costofconversation {
  cumulative: number;
  total: number;
  input: [number, number];
  output: [number, number];
  cachewrite: [number, number];
  cacheread: [number, number];
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
  location: { latitude: number; longitude: number };
  cost: {
    total: number;
    input: [number, number];
    output: [number, number];
    cachewrite: [number, number];
    cacheread: [number, number];
  };
}

export interface ChatActions {
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setCurrentProcessingStep: (currentProcessingStep: string) => void;
  setUserPreferences: (
    userPreferences:
      | UserPreferences
      | ((prev: UserPreferences) => UserPreferences)
  ) => void;
  setCost: (
    userPreferences:
      | costofconversation
      | ((prev: costofconversation) => costofconversation)
  ) => void;
}

export interface timestamp {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export type Message =
  | {
      role: "system";
      content: string;
      timestamp: timestamp;
    }
  | {
      role: "assistant";
      content: string;
      model: string;
      modelProvider: string;
      timestamp: timestamp;
      context?: {
        reasoning: string;
        sources: SearchResult[];
      };
    }
  | {
      role: "user";
      content: string;
      timestamp: timestamp;
      location: { latitude: number; longitude: number };
      userPreferences: UserPreferences;
    }
  | {
      role: "developer";
      content: string;
      timestamp: timestamp;
    };

export interface SearchResult {
  title?: string;
  link: string;
  snippet?: string;
}

export interface MessageBubbleProps {
  message: Message;
  messageComponentIndex: number;
  currentProcessingStep?: string;
  cost: costofconversation;
}

export const systemMessage: Message = {
  role: "system",
  content: `You are AGNI, a helpful assistant that provides straightforward, jargon-free, and precise responses. Inspired by the fire element known for its power to purify and transform, you help users understand their curiosity, clarify their intent, and internalize learnings from first principles.

For factual questions, provide direct, concise answers without repeating the question. Minimize output length - every word must add value. Example: If asked "what is the capital of India?", simply respond "New Delhi".

For complex topics, encourage users to attempt answers first, then guide them using the Socratic method. You use simple analogies and metaphors to help users grasp the essence of the topic. Provide hints and relevant information as they think through the problem, helping them unravel their understanding step by step.

For context, today's date is ${new Date().toLocaleDateString()}`,

  timestamp: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    second: new Date().getSeconds(),
  },
};
