import { getModelStream } from "@/Models/Stream/Handlers/getStream";
import { SystemMessageForText } from "./Utils/promt&type";
import { Dispatch, useState } from "react";
import { SetStateAction } from "react";

interface conversationHistory {
  role: string;
  content: string;
  timestamp: string;
}

export const handleRawTextInput = async (
  input: string,
  setText: Dispatch<SetStateAction<string>>
) => {
  let contextMessage = "";

  const extractAndRemoveMessage = (text: string) => {
    const regex = /\[\[(.*?)\]\]/g; // Regex to match text inside [[ ]]
    const matches = [];
    let match: RegExpExecArray | null;
    let extractedMessage = "";

    // Find all matches of text inside [[ ]] and store them
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
      console.log("match 0", match[0]);
      console.log("match 1", match[1]);
      console.log("matches", matches);
    }

    // If no bracketed text was found, return early
    if (matches.length === 0) {
      return;
    }

    if (matches.length > 0) {
      extractedMessage = matches[0]; // Take the first match
      const cleanedText = text.replace(/\[\[.*?\]\]/, "").trim(); // Remove the first bracketed text
      setText(cleanedText); // Update UI with text without brackets
      contextMessage = cleanedText; // Store as context for the conversation
      return extractedMessage; // Return the extracted message
    }

    return text; // Fallback to return original text
  };

  const Message = `Your output should have a natural flow from the context and should also answer the question. 
  Your answer will be appended to the context and that will form a new writing. 
  All of this is for your reference and should not be mentioned in the output. 
  The output should be as succinct, precise, simple, and jargon free as possible. In many instances just give a direct answer without any explanation. 
  Give explanations only when its really really necessary. Keep your output as succinct as possible.`;

  // Process the input to extract any message in double brackets
  const userQuestion = extractAndRemoveMessage(input);

  // Prepare the final message with context if available
  const finalMessage = contextMessage
    ? "The context for this question is: " +
      contextMessage +
      "\n\n" +
      "The question is: " +
      userQuestion +
      Message
    : input;

  // Get the model stream
  const response = await getModelStream(
    "OpenAI",
    {
      userMessage: finalMessage,
      systemMessage: SystemMessageForText.content,
      conversationHistory: [],
      model: "gpt-4o-mini",
      context: true,
    },
    () => {
      // We'll handle streaming in the return object
    }
  );
  for await (const chunk of response.stream()) {
    setText((prev) => prev + chunk);
  }

  return {
    stream: () => response.stream(),
    getText: async () => await response.getText(),
  };
};
