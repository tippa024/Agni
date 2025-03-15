import { ChatActions, SearchResult } from "../../utils/type";

export const SetMessage = {
  InitialiseNewAssistant: function (setMessages: ChatActions["setMessages"]) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);
  },

  UpdateAssistantContent: function (
    content: string,
    setMessages: ChatActions["setMessages"]
  ) {
    setMessages((prev) => {
      return prev.map((msg, index) => {
        if (index === prev.length - 1 && msg.role === "assistant") {
          return { ...msg, content: content };
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
