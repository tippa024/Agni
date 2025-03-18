import { conversationHistory } from "../../../../utils/Chat/prompt&type";
import { SynthesizeAPI } from "../../../../utils/Context/Synthesize/apiCall";

export const SynthesizeChatSessionToMarkdown = async (
  conversationHistory: conversationHistory[]
) => {
  if (conversationHistory.length === 0) return;

  console.log("Synthesizing conversation to markdown...");

  try {
    // Step 1: Generate markdown synthesis
    console.log("Synthesizing conversation to markdown...");
    //Hardcoded for now
    const model = "claude-3-5-sonnet-20240620";
    const modelProvider = "Anthropic";
    const context = await SynthesizeAPI.ConversationToMarkDown(
      conversationHistory,
      model,
      modelProvider
    ).catch((error) => {
      console.error("Error synthesizing conversation to markdown:", error);
      return null;
    });
    return context;
  } catch (error) {
    console.error(
      "Error in Saving Conversation History and/or Synthesizing Conversation to Markdown:",
      error
    );
  }
};
