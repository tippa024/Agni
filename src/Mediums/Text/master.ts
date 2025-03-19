import { getModelStream } from "@/Models/Stream/Handlers/getStream";

export const handleRawTextInput = async (input: string) => {
  console.log("handleRawTextInput input", input);
  const response = await getModelStream(
    "OpenAI",
    {
      userMessage: input,
      systemMessage:
        "you are helping the user as they are writing a text. your output will be added to input that you get. So your job is the just complete the sentence or add to the sentence that the user has written so far. Keep your response short and concise. Limit to one word/sentence as much as possible to better understand the user's intent over time and fine tune your output",
      conversationHistory: [],
      model: "gpt-4o-mini",
      context: true,
    },
    () => {}
  );

  return {
    stream: () => response.stream(),
    getText: async () => await response.getText(),
  };
};
