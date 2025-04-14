import { SearchResult, Message } from "../../Utils/prompt&type";
import { Dispatch, SetStateAction } from "react";

export const setMessage = {
  InitialiseNewAssistant: function (
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
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

  NewRoleAndContent: function (
    role: "user" | "assistant",
    content: string,
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    setMessages((prev) => [
      ...prev,
      {
        role: role,
        content: content,
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

  SourcesToCurrent: function (
    sources: SearchResult[],
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        if (sources.length > 0) {
          lastMessage.sources = sources;
        } else {
          lastMessage.sources = [];
        }
      }
      return newMessages;
    });
  },
  AddCostToCurrent: function (
    cost: number,
    setMessages: Dispatch<SetStateAction<Message[]>>
  ) {
    console.log("setting cost to current message", cost);
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.additionalInfo = `${cost.toFixed(6)} $`;
      }
      return newMessages;
    });
  },
};
