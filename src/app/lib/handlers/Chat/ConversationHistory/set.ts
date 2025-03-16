import { conversationHistory, UserPreferences } from "../../../utils/type";

export const setConversationHistory = {
  AddSystemMessage: function (
    content: string,
    setConversationHistory: (
      history:
        | conversationHistory[]
        | ((prev: conversationHistory[]) => conversationHistory[])
    ) => void
  ) {
    setConversationHistory((prev) => [
      ...prev,
      {
        role: "system",
        content: content,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      },
    ]);
  },

  AddUserMessage: function (
    content: string,
    location: { latitude: number; longitude: number },
    userPreferences: UserPreferences,
    setConversationHistory: (
      history:
        | conversationHistory[]
        | ((prev: conversationHistory[]) => conversationHistory[])
    ) => void
  ) {
    setConversationHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: content,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        location: location,
        userPreferences: userPreferences,
      },
    ]);
  },

  AddAssistantMessage: function (
    content: string,
    model: string,
    modelProvider: string,
    setConversationHistory: (
      history:
        | conversationHistory[]
        | ((prev: conversationHistory[]) => conversationHistory[])
    ) => void
  ) {
    setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content: content,
        model: model,
        modelProvider: modelProvider,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      },
    ]);
  },

  AddDeveloperMessage: function (
    content: string,
    setConversationHistory: (
      history:
        | conversationHistory[]
        | ((prev: conversationHistory[]) => conversationHistory[])
    ) => void
  ) {
    setConversationHistory((prev) => [
      ...prev,
      {
        role: "developer",
        content: content,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      },
    ]);
  },
};
