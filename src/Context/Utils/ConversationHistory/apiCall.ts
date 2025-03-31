import { conversationHistory } from "@/Mediums/Chat/Utils/prompt&type";

export const conversationHistoryAPI = {
  addNewMessages: async (conversationHistory: conversationHistory[]) => {
    console.log(
      "Adding new messages to conversation history via AddNewMessagesToConversationHistory API Call starting"
    );
    try {
      const response = await fetch(`/api/Context/ConversationHistory/Write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationHistory }),
      });
      const data = await response.json();
      console.log("AddNewMessagesToConversationHistory API Response", data);
      // example of data is
      // {
      //     "message": "Conversation history saved",
      //     "newMessagesCount": 5
      //     "newMessages": [newMessages]
      // }
      console.log(
        "AddNewMessagesToConversationHistory API Call completed",
        data
      );
      return data;
    } catch (error) {
      console.error(
        "Error adding new messages to conversation history:",
        error
      );
      return null;
    }
  },

  read: async () => {
    console.log("ReadConversationHistory API Call starting");
    try {
      const response = await fetch(`/api/Context/ConversationHistory/Read`);
      const data = await response.json();
      console.log("ReadConversationHistory API Response", data);
      // example of data is
      // {
      //     "conversationHistory": [conversationHistory]
      // }
      console.log("ReadConversationHistory API Call completed");
      return data;
    } catch (error) {
      console.error("Error reading conversation history:", error);
      return null;
    }
  },
};
