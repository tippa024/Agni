import { conversationHistory } from "../../../type";

export const AddNewMessagesToConversationHistory = async (
  conversationHistory: conversationHistory[]
) => {
  console.log(
    "Adding new messages to conversation history via AddNewMessagesToConversationHistory API"
  );
  try {
    const response = await fetch(`/api/History/ConversationHistory/Write`, {
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
    return data;
  } catch (error) {
    console.error("Error adding new messages to conversation history:", error);
    return null;
  }
};
