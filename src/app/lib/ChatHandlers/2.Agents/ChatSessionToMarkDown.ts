import { conversationHistory } from "../../utils/type";
import { WriteNewToContext } from "../../utils/API/History/Context/WriteANewFile";
import { AddNewMessagesToConversationHistory } from "../../utils/API/History/Conversation/Write";
import { SynthesizeConversationToMarkDownusingAnthropic } from "../../utils/API/Models/Agent/SynthesizeConversation";

export const ChatToContext = async (
  conversationHistory: conversationHistory[]
) => {
  const userPrompt = `
   Analyze our conversation to understand why the user engaged in this discussion and what they were trying to achieve. Create a concise markdown summary that captures:

      1. The user's personal connection to this topic (why it matters to them)
      2. Key facts, preferences, and knowledge the user has demonstrated
      3. The user's goals, interests, and questions related to this subject
      4. Any specific insights or conclusions reached during our conversation

      Format the summary with:
      - A descriptive title that clearly identifies the main topic
      - Logical section headers that organize the information
      - The user's intent section (why they care about this topic)
      - Key aspects of the topic that were discussed
      - Core lessons or takeaways from the conversation
      - Any personal reflections or applications mentioned by the user

      This markdown will serve as context for future conversations on similar topics, helping provide continuity and personalization in our interactions.
      
      You many not be able to cover all the points, so use your best judgement as best as you can. Even if you think you have way less context than you need, take a stab at it and clarify the lack of context in the markdown. Please revent back in the requested format with a clear title name and markdown content as the two objects.
   `;
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
      content: userPrompt,
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
    const context = await SynthesizeConversationToMarkDownusingAnthropic(
      messageforAnthropic,
      "claude-3-5-sonnet-20240620"
    ).catch((error) => {
      console.error("Error synthesizing conversation to markdown:", error);
      return null;
    });

    if (
      context?.markdown === "Not enough context to synthesize a markdown file"
    ) {
      console.log(context.text);
      return;
    }

    // Step 3: Save markdown to context file if synthesis was successful
    console.log("Saving synthesized markdown as context file...");

    if (context && context.filename && context.markdown) {
      await WriteNewToContext(
        `${context?.filename}.md`,
        context?.markdown
      ).catch((error) =>
        console.error("Error saving markdown as context file:", error)
      );
      console.log("Synthesized markdown saved as context file");
    } else {
      console.log(
        "issue with processing context file" + context + "unable to save"
      );
    }
  } catch (error) {
    console.error(
      "Error in Saving Conversation History and/or Synthesizing Conversation to Markdown:",
      error
    );
  }
};
