import { conversationHistory } from "../type";

export const SynthesizeConversationToMarkDownusingAnthropic = async (
  conversation: conversationHistory[],
  model: string
) => {
  console.log(
    "Synthesizing conversation to markdown using Anthropic model",
    model
  );
  try {
    const response = await fetch(
      "/api/Models/Anthropic/SynthesisConversation",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation,
          model: model,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error synthesizing conversation:", errorData);
      throw new Error(
        `Failed to synthesize conversation: ${
          errorData.error || response.statusText
        }`
      );
    }

    const data = await response.json();
    console.log("Synthesized markdown", data);

    // Return the markdown and filename from the response
    return {
      markdown: data.markdown,
      filename: data.filename,
    };
  } catch (error: any) {
    console.error(
      "Error in SynthesizeConversationToMarkDownusingAnthropic:",
      error
    );
    throw error;
  }
};
