export const ReadConversationHistory = async () => {
  console.log("ReadConversationHistory API Call starting");
  try {
    const response = await fetch(`/api/History/ConversationHistory/Read`);
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
};
