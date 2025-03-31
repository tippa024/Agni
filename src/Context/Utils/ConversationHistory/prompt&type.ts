import { UserPreferences } from "@/Mediums/Chat/Utils/prompt&type";

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
