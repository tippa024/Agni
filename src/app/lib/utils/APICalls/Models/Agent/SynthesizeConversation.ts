import { conversationHistory } from "../../../Chat/prompt&type";

export const SynthesizeConversationToMarkDownusingAnthropic = async (
  conversation: conversationHistory[],
  model: string
) => {
  console.log(
    "Synthesizing conversation to markdown using Anthropic model API call starting",
    model,
    conversation
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
    console.log(
      "SynthesizeConversationToMarkDownusingAnthropic API call output",
      data
    );

    if (data.filename === "" && data.markdown !== "") {
      data.filename = `Context_${new Date()
        .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        .replace(/[/:\s]/g, "-")}`;
      console.log(
        "filename missing from Anthropic API call, using boilerplate filename",
        data.filename
      );
    }

    if (data.markdown === "" && data.text !== "") {
      data.markdown = "Not enough context to synthesize a markdown file";
      console.log(data.markdown);
    }

    console.log(
      "SynthesizeConversationToMarkDownusingAnthropic API call is completed"
    );

    return {
      text: data.text as string,
      markdown: data.markdown as string,
      filename: data.filename as string,
    };
  } catch (error: any) {
    console.error(
      "Error in SynthesizeConversationToMarkDownusingAnthropic:",
      error
    );
    throw error;
  }
};
