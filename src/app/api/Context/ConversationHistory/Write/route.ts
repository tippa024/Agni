import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("Write to Conversation History API route starting");

  try {
    const { conversation } = await request.json().catch((error) => {
      console.error("Error parsing request JSON:", error);
      throw new Error("Invalid JSON in request body");
    });

    if (!conversation || !Array.isArray(conversation)) {
      console.error("Invalid conversation history format:", conversation);
      return NextResponse.json(
        { error: "Invalid conversation history format" },
        { status: 400 }
      );
    }

    const conversationHistoryPath = path.join(
      process.cwd(),
      "conversationHistory.json"
    );

    const conversationHistoryDir = path.dirname(conversationHistoryPath);
    if (!fs.existsSync(conversationHistoryDir)) {
      try {
        await fsPromises.mkdir(conversationHistoryDir, { recursive: true });
      } catch (error) {
        console.error("Error creating directory:", error);
        return NextResponse.json(
          { error: "Failed to create directory for conversation history" },
          { status: 500 }
        );
      }
    }

    let existingHistory = [];
    if (fs.existsSync(conversationHistoryPath)) {
      try {
        const fileContent = fs.readFileSync(conversationHistoryPath, "utf8");
        existingHistory = JSON.parse(fileContent);
      } catch (error) {
        console.error("Error reading existing conversation history:", error);
      }
    }

    const newMessages = conversation.filter((newMsg: Message) => {
      if (!newMsg.timestamp) return true;
      return !existingHistory.some(
        (existingMsg: Message) =>
          existingMsg.timestamp === newMsg.timestamp &&
          existingMsg.role === newMsg.role
      );
    });

    const updatedHistory = [...existingHistory, ...newMessages];

    try {
      fs.writeFileSync(conversationHistoryPath, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error writing conversation history to file:", error);
      return NextResponse.json(
        { error: "Failed to save conversation history" },
        { status: 500 }
      );
    }

    console.log(
      `Write to Conversation History API route completed. Added ${
        newMessages.length
      } new messages ${JSON.stringify(newMessages)}`
    );

    return NextResponse.json({
      message: "Conversation history updated",
      newMessagesCount: newMessages.length,
      newMessages: newMessages,
    });
  } catch (error) {
    console.error("Unexpected error in conversation history write API:", error);
    return NextResponse.json(
      { error: "Failed to process conversation history" },
      { status: 500 }
    );
  }
}
