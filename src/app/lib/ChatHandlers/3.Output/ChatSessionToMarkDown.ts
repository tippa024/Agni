import { conversationHistory } from "../../utils/type";

export const ChatToContext = async (
  conversationHistory: conversationHistory[]
) => {
  const messageforAnthropic = [
    ...conversationHistory
      .filter((msg) => msg.role !== "system")
      .reduce((acc: any[], msg, index, array) => {
        // Only push role and content from the message
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
      }, []),
    {
      role: "user",
      content:
        "Please convert the conversation so far to markdown. Be smart and exctact the core inisghts from the conversation and convert it to markdown. Keep it as short and as concise as possible. Really think deeply to minimize the length of the markdown. ",
    },
  ];

  try {
    // Try to save the conversation
    if (conversationHistory.length > 0) {
      console.log("Saving conversation before unload...");

      fetch("/api/History/ConversationHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationHistory }),
      });

      console.log("Message for Anthropic", messageforAnthropic);

      const SynthesisConversationToMarkDown = await fetch(
        "/api/Models/Anthropic/ConversationToMarkDown",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messageforAnthropic,
            model: "claude-3-5-haiku-20241022",
          }),
        }
      );

      const SynthesisConversationToMarkDownData =
        await SynthesisConversationToMarkDown.json();
      console.log(
        "SynthesisConversationToMarkDownData",
        SynthesisConversationToMarkDownData
      );

      console.log("Saving markdown before unload");

      fetch("/api/History/MarkDown/Save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: SynthesisConversationToMarkDownData.markdown,
        }),
      });

      console.log("Conversation saved before unload");
    }
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
};
