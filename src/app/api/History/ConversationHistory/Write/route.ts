import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";
import { conversationHistory } from "@/app/lib/utils/type";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("Write to Conversation History API route starting");

  try {
    // Parse request body
    const { conversationHistory } = await request.json().catch((error) => {
      console.error("Error parsing request JSON:", error);
      throw new Error("Invalid JSON in request body");
    });

    // Validate input
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      console.error(
        "Invalid conversation history format:",
        conversationHistory
      );
      return NextResponse.json(
        { error: "Invalid conversation history format" },
        { status: 400 }
      );
    }

    const conversationHistoryPath = path.join(
      process.cwd(),
      "conversationHistory.json"
    );

    // Create directory if it doesn't exist
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
        // Continue with empty array if file exists but can't be parsed
      }
    }

    // Check for duplicate messages based on timestamps
    const newMessages = conversationHistory.filter(
      (newMsg: conversationHistory) => {
        // If no timestamp, treat as new message
        if (!newMsg.timestamp) return true;

        // Check if this message already exists in history
        return !existingHistory.some(
          (existingMsg: conversationHistory) =>
            existingMsg.timestamp === newMsg.timestamp &&
            existingMsg.role === newMsg.role
        );
      }
    );

    // Combine existing history with only new conversation messages
    const updatedHistory = [...existingHistory, ...newMessages];

    // Write the updated history back to the file
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
