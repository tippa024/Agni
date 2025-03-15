import { systemMessage } from "../../utils/promt";
import { Message, ChatActions } from "../../utils/type";

// Anthropic Chat Response
export const AnthropicChatResponse = async (
  messages: Message[],
  actions: ChatActions,
  model: string
) => {
  console.log("calling Anthropic API");
  const finalResponse = await fetch("/api/Models/Anthropic/Chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemMessage: systemMessage.content,
      messages: messages,
      model: model,
    }),
  });

  const reader = finalResponse.body?.getReader();
  if (!reader) throw new Error("No reader available");

  if (!finalResponse.ok) {
    const errorText = await finalResponse.text();
    console.error("Anthropic Chat API Error Details:", {
      status: finalResponse.status,
      statusText: finalResponse.statusText,
      error: errorText,
    });

    throw new Error(
      `Failed to get response from Anthropic API (${finalResponse.status}): ${errorText}`
    );
  }

  const decoder = new TextDecoder();
  let content = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk.trim()) {
        content += chunk;

        console.log("Chunk", chunk);

        actions.setMessages((prev) => {
          return prev.map((msg, index) => {
            if (index === prev.length - 1 && msg.role === "assistant") {
              return { ...msg, content: content };
            }
            return msg;
          });
        });
      }
    }
    console.log("Content", content);
    return content;
  } catch (streamError) {
    console.error(
      "Stream error with Anthropic API in finalResponsehandler",
      streamError
    );
    throw streamError;
  } finally {
    reader.releaseLock();
  }
};

// OpenAI Chat Response
export const OpenAIChatResponse = async (
  messages: Message[],
  actions: ChatActions,
  model: string,
  location: { latitude: number; longitude: number } | null
) => {
  console.log("calling OpenAI API");
  const finalResponse = await fetch("/api/Models/OpenAI/Chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [systemMessage, ...messages],
      model: model,
    }),
  });

  const reader = finalResponse.body?.getReader();
  if (!reader) throw new Error("No reader available");

  if (!finalResponse.ok) {
    const errorText = await finalResponse.text();
    console.error("OpenAI Chat API Error Details:", {
      status: finalResponse.status,
      statusText: finalResponse.statusText,
      error: errorText,
    });

    actions.setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        lastMessage.content = errorText;
      }
      return newMessages;
    });

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content: errorText,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: model,
        modelProvider: "OpenAI",
      },
    ]);

    throw new Error(
      `Failed to get response (${finalResponse.status}): ${errorText}`
    );
  }

  const decoder = new TextDecoder();
  let content = "";

  let lastUpdateTime = Date.now();
  let chunkCount = 0;
  const updateInterval = 100; // 100ms

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk.trim()) {
        content += chunk;
        chunkCount++;
        if (Date.now() - lastUpdateTime > updateInterval) {
          actions.setMessages((prev) => {
            return prev.map((msg, index) => {
              if (index === prev.length - 1 && msg.role === "assistant") {
                return { ...msg, content: content };
              }
              return msg;
            });
          });
          lastUpdateTime = Date.now();
        }
      }
    }

    if (content.trim()) {
      actions.setMessages((prev) => {
        return prev.map((msg, index) => {
          if (index === prev.length - 1 && msg.role === "assistant") {
            return { ...msg, content: content };
          }
          return msg;
        });
      });
    }

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content: content,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: model,
        modelProvider: "OpenAI",
      },
    ]);
    return content;
  } catch (streamError) {
    console.error(
      "Stream error at OpenAIChatResponse in finalResponsehandler",
      streamError
    );

    actions.setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        lastMessage.content =
          " I apologize, but I encountered an error while processing your request. Please try again. location: finalResponsehandler.ts - OpenAIChatResponse" +
          streamError;
      }
      return newMessages;
    });

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          " I apologize, but I encountered an error while processing your request. Please try again. location: finalResponsehandler.ts - OpenAIChatResponse" +
          streamError,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: model,
        modelProvider: "OpenAI",
      },
    ]);
    throw streamError;
  } finally {
    reader.releaseLock();
  }
};
