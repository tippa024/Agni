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
    let match: RegExpExecArray | null = null;
    let extractedMessage = "";

    // Find all matches of text inside [[ ]] and store them
    while ((match = regex.exec(text)) !== null) {
      console.log("match", match);
      matches.push(match[0]);
      console.log("matches", matches);
    }

    // If no bracketed text was found, return early
    if (matches.length === 0) {
      return;
    }

    if (matches.length > 0) {
      console.log("matches before assignment", matches);
      extractedMessage = matches.join(""); // Join all matches into a single string
      const cleanedText = text.replace(/\[\[.*?\]\]/g, "").trim(); // Remove all bracketed text
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

  console.log("finalMessage", finalMessage);

  // Get the model stream
  const response = await getModelStream(
    "OpenAI",
    {
      userMessage: finalMessage,
      systemMessage: SystemMessageForText.content,
      conversationHistory: [],
      model: "gpt-4o-mini",
      context: false,
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
