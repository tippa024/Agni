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

    actions.setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        lastMessage.content =
          " I apologize, but I encountered an error while processing your request. Please try again." +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          errorText;
      }
      return newMessages;
    });

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          " I apologize, but I encountered an error while processing your request. Please try again." +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          errorText,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: model,
        modelprovider: "Anthropic",
      },
    ]);

    console.log(
      "Anthropic Chat API Error and Messages and History updated accordingly"
    );

    throw new Error(
      `Failed to get response (${finalResponse.status}): ${errorText}`
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

    console.log("Anthropic API Response completed");

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content: content,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: model,
        modelprovider: "Anthropic",
      },
    ]);
    console.log("History updated");
  } catch (streamError) {
    console.error(
      "Stream error at AnthropicChatResponse in finalResponsehandler",
      streamError
    );
    actions.setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        lastMessage.content =
          " I apologize, but I encountered an error while parsing the Anthropic API response. Please try again. location: finalResponsehandler.ts - AnthropicChatResponse line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          streamError;
      }
      return newMessages;
    });

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          " I apologize, but I encountered an error while parsing the Anthropic API response. Please try again. location: finalResponsehandler.ts - AnthropicChatResponse line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          streamError,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: model,
        modelprovider: "Anthropic",
      },
    ]);
    console.log(
      "Error with parsing Anthropic API response, History updated accordingly"
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
  model: string
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
        modelprovider: "OpenAI",
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
        modelprovider: "OpenAI",
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
          " I apologize, but I encountered an error while processing your request. Please try again. location: finalResponsehandler.ts - OpenAIChatResponse line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          streamError;
      }
      return newMessages;
    });

    actions.setConversationHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          " I apologize, but I encountered an error while processing your request. Please try again. location: finalResponsehandler.ts - OpenAIChatResponse line:" +
          new Error().stack?.split("\n")[1]?.match(/\d+/)?.[0] +
          streamError,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        model: model,
        modelprovider: "OpenAI",
      },
    ]);
    throw streamError;
  } finally {
    reader.releaseLock();
  }
};
