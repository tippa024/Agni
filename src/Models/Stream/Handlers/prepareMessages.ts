import { Message } from "@/Mediums/Chat/Utils/prompt&type";

export function StreamlineConversationForAPI(
  conversationHistory: Array<Pick<Message, "role" | "content"> | Message>
): Array<Pick<Message, "role" | "content">> {
  console.log("StreamlineConversationForAPI", conversationHistory);
  return conversationHistory
    .filter((msg) => msg.role !== "system")
    .reduce(
      (acc: Array<Pick<Message, "role" | "content">>, msg, index, array) => {
        acc.push({
          role: msg.role as "user" | "assistant" | "system",
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
      },
      []
    );
}
