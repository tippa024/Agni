import { ChatActions, SearchResult } from "../../Utils/prompt&type";

export const setMessage = {
  InitialiseNewAssistant: function (setMessages: ChatActions["setMessages"]) {
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
    setMessages: ChatActions["setMessages"]
  ) {
    setMessages((prev) => {
      return prev.map((msg, index) => {
        if (index === prev.length - 1 && msg.role === "assistant") {
          return {
            ...msg,
            content: content,
            timestamp:
              new Date().toLocaleDateString("en-GB") +
              " " +
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
          };
        }
        return msg;
      });
    });
  },

  NewRoleAndContent: function (
    role: "user" | "assistant",
    content: string,
    setMessages: ChatActions["setMessages"]
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
    setMessages: ChatActions["setMessages"]
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
};
