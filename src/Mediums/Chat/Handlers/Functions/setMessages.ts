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
        timestamp: {
          year: new Date().getFullYear(),
          month: new Date().getMonth(),
          day: new Date().getDate(),
          hour: new Date().getHours(),
          minute: new Date().getMinutes(),
          second: new Date().getSeconds(),
        },
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
        timestamp: {
          year: new Date().getFullYear(),
          month: new Date().getMonth(),
          day: new Date().getDate(),
          hour: new Date().getHours(),
          minute: new Date().getMinutes(),
          second: new Date().getSeconds(),
        },
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
        timestamp: {
          year: new Date().getFullYear(),
          month: new Date().getMonth(),
          day: new Date().getDate(),
          hour: new Date().getHours(),
          minute: new Date().getMinutes(),
          second: new Date().getSeconds(),
        },
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
    const currentTime = {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      day: new Date().getDate(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
      second: new Date().getSeconds(),
    };
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
