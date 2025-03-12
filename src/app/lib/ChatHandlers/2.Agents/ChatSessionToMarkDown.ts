import { conversationHistory } from "../../utils/type";
import {
  WriteToContext,
  AddNewMessagesToConversationHistory,
  ReadConversationHistory,
} from "../../utils/API/HistoryAPICalls";
import { SynthesizeConversationToMarkDownusingAnthropic } from "../../utils/API/ModelAPICalls";

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
      content: `You seek to understand why the user might have had the conversation and what they might have been trying to achieve. You note the key insights, preferences, and goals of the user. Please analyze our conversation and create a concise markdown summary with the following characteristics:
      
      1. Extract only the most important insights, key points, and conclusions
      2. Organize the content logically with clear section headers. 
      3. Include a descriptive filename that reflects the main topic of our conversation
      
      The markdown should be easy to read, well-structured, and capture the essence of our discussion without unnecessary details.`,
    },
  ];

  // Only process if we have conversation history
  if (conversationHistory.length === 0) return;

  console.log("Updating conversation history...");

  try {
    // Step 1: Save conversation history
    await AddNewMessagesToConversationHistory(conversationHistory);

    // Step 2: Generate markdown synthesis
    console.log("Synthesizing conversation to markdown...");
    const synthesisResult =
      await SynthesizeConversationToMarkDownusingAnthropic(
        messageforAnthropic,
        "claude-3-5-sonnet-20240620"
      ).catch((error) => {
        console.error("Error synthesizing conversation to markdown:", error);
        return null;
      });

    // Step 3: Save markdown to context file if synthesis was successful
    if (synthesisResult?.markdown && synthesisResult?.filename) {
      console.log("Saving synthesized markdown as context file...");
      const filename =
        `${synthesisResult.filename}.md` ||
        `Context_${new Date()
          .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          .replace(/[/:\s]/g, "-")}.md`;

      await WriteToContext(filename, synthesisResult.markdown).catch((error) =>
        console.error("Error saving markdown as context file:", error)
      );

      console.log("Synthesized markdown saved as context file");
    }
  } catch (error) {
    console.error(
      "Error in Saving Conversation History and/or Synthesizing Conversation to Markdown:",
      error
    );
  }
};
