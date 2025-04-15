import {
  SearchResult,
  Message,
  UserPreferences,
} from "../../Utils/prompt&type";
import { Dispatch, SetStateAction } from "react";

export const setMessage = {
  NewUserMessage: function (
    content: string,
    location: { latitude: number; longitude: number },
    userPreferences: UserPreferences,
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: content,
        timestamp:
          new Date().toLocaleDateString("en-GB") +
          " " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        location: location,
        userPreferences: userPreferences,
      },
    ]);
  },

  NewAssistantMessage: function (
    content: string,
    model: string,
    modelProvider: string,
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: content,
        model: model,
        modelProvider: modelProvider,
        timestamp:
          new Date().toLocaleDateString("en-GB") +
          " " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
      },
    ]);
  },

  InitialiseNewAssistant: function (
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        model: "",
        modelProvider: "",
        timestamp:
          new Date().toLocaleDateString("en-GB") +
          " " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        context: {
          reasoning: "",
          sources: [],
        },
      },
    ]);
  },

  UpdateAssistantContentandTimeStamp: function (
    content: string,
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    const currentTime =
      new Date().toLocaleDateString("en-GB") +
      " " +
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    setMessages((prev) => {
      return prev.map((msg, index) => {
        if (index === prev.length - 1 && msg.role === "assistant") {
          return {
            ...msg,
            content: content,
            timestamp: currentTime,
          };
        }
        return msg;
      });
    });
  },

  SourcesToCurrent: function (
    sources: SearchResult[],
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        if (sources && lastMessage.context) {
          lastMessage.context.sources = sources;
        } else {
          console.log("sources or lastMessage.context is undefined");
        }
      }
      return newMessages;
    });
  },
};
