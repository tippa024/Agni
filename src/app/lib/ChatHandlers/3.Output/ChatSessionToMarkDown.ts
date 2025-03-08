import { conversationHistory } from "../../utils/type";

export const ChatSessionToMarkDown = async (
  conversationHistory: conversationHistory[]
) => {
  try {
    if (!conversationHistory || conversationHistory.length === 0) {
      console.log("No conversation history to convert");
      return null;
    }

    // Make the API call to convert chat to markdown
    const ChatToMarkDown = await fetch("/api/Anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationHistory,
        system:
          "Convert this conversation to a well-formatted markdown document. Include all questions and answers.",
      }),
    });

    if (!ChatToMarkDown.ok) {
      const errorText = await ChatToMarkDown.text();
      console.error("Anthropic Chat API Error Details:", {
        status: ChatToMarkDown.status,
        statusText: ChatToMarkDown.statusText,
        error: errorText,
      });
      return null; // Return early if the API call failed
    }

    // Only proceed if the response was successful
    try {
      // Get the response as text
      const markdownContent = await ChatToMarkDown.text();

      // Save the markdown content
      const saveResponse = await fetch("/api/MarkDown/Save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdownContent }),
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to save markdown: ${saveResponse.status}`);
      }

      const result = await saveResponse.json();
      console.log(`Markdown saved successfully as ${result.filename}`);
      return result;
    } catch (streamError) {
      console.error("Error processing response stream:", streamError);
      return null;
    }
  } catch (error) {
    console.error("Error in ChatSessionToMarkDown:", error);
    return null;
  }
};
