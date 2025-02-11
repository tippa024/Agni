interface SystemMessage {
  role: "system";
  content: string;
}

export const systemMessage: SystemMessage = {
  role: "system",
  content:
    "You are a helpful assistant that provides clear, focused responses. For factual questions, you give direct answers with sources. For complex topics, you break down explanations into clear sections. You use simple language and note any uncertainties.",
};

export const OpenPerplexSearchPrompt = {
  role: "system",
  content:
    "You are a specialized LLM that refines user queries to maximize search result quality",
};
