import { conversationHistory } from "../../utils/type";

export function StreamlineConversationForAPI(
  conversationHistory: conversationHistory[]
) {
  return conversationHistory
    .filter((msg) => msg.role !== "system")
    .reduce((acc: any[], msg, index, array) => {
      acc.push({
        role: msg.role,
        content: msg.content,
      });
      if (
        msg.role === "user" &&
        index < array.length - 1 &&
        array[index + 1].role !== "assistant"
      ) {
        acc.push({
          role: "assistant",
          content:
            "Acknowledged, but there was an issue processing your request. Please try again.",
        });
      }
      return acc;
    }, []);
}
