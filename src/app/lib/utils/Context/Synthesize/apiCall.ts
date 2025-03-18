import { conversationHistory, Message } from "../../Chat/prompt&type";
import { SynthesizeConversationToMarkDownSystemPrompt } from "./prompt&type";

export const SynthesizeAPI = {
  ConversationToMarkDown: async (
    conversationHistory: conversationHistory[],
    model: string,
    modelProvider: string
  ) => {
    if (conversationHistory.length === 0) {
      console.log("Conversation history is empty, skipping synthesis");
      return null;
    }

    console.log(
      "Synthesizing conversation to markdown using Anthropic model API call starting",
      model,
      conversationHistory
    );

    const synthesisMessage = {
      role: "user",
      content: `
      ${JSON.stringify(conversationHistory, null, 2)}
      `,
    } as Message;

    try {
      if (modelProvider === "Anthropic") {
        try {
          const response = await fetch(
            "/api/Models/Anthropic/SynthesisConversation",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemMessage:
                  SynthesizeConversationToMarkDownSystemPrompt.content,
                messages: [synthesisMessage],
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

          //handle the case where the filename is missing from the API call
          if (data.filename === "" && data.markdown !== "") {
            data.filename = `Context_${new Date()
              .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
              .replace(/[/:\s]/g, "-")}`;
            console.log(
              "filename missing from Anthropic API call, using boilerplate filename",
              data.filename
            );
          }

          //handle the case where the markdown is missing from the API call
          if (data.markdown === "" && data.text !== "") {
            data.markdown = "Not enough context to synthesize a markdown file";
            console.log(data.markdown);
            return;
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
      }

      if (modelProvider === "OpenAI") {
        try {
          //TODO: implement OpenAI API call
        } catch (error: any) {
          console.error(" OpenAI API call not implemented yet");
          throw error;
        }
      }
      throw new Error(
        "Model provider " +
          modelProvider +
          " not supported for synthesizing conversation to markdown"
      );
    } catch (error: any) {
      console.error(
        "Error in SynthesizeConversationToMarkDownusingAnthropic:",
        error
      );
      throw error;
    }
  },
};
