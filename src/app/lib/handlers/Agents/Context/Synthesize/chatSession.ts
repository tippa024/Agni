import {
  conversationHistory,
  Message,
} from "../../../../utils/Chat/prompt&type";
import { SynthesizeAPI } from "../../../../utils/Context/Synthesize/apiCall";
import { MarkdownAPI } from "../../../../utils/Context/Markdown/apiCall";

export const SynthesizeChatSessionToContext = async (
  conversationHistory: conversationHistory[]
) => {
  const synthesisMessage = {
    role: "user",
    content: `
    ${JSON.stringify(conversationHistory, null, 2)}
    `,
  } as Message;

  if (conversationHistory.length === 0) return;

  console.log("Updating conversation history...");

  try {
    // Step 1: Generate markdown synthesis
    console.log("Synthesizing conversation to markdown...");
    //Hardcoded for now
    const model = "claude-3-5-sonnet-20240620";
    const modelProvider = "Anthropic";
    const context = await SynthesizeAPI.ConversationToMarkDown(
      synthesisMessage,
      model,
      modelProvider
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

    // Step 2: Save markdown to context file if synthesis was successful
    console.log("Saving synthesized markdown as context file...");

    if (context && context.filename && context.markdown) {
      await MarkdownAPI.WriteNewToContext(
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
