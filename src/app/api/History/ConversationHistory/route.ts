//api/ConversationHistory/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";
import { conversationHistory } from "@/app/lib/utils/type";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("Saving conversation history...");
  const { conversationHistory } = await request.json();

  console.log(conversationHistory);

  const conversationHistoryPath = path.join(
    process.cwd(),
    "conversationHistory.json"
  );

  // Create directory if it doesn't exist
  const conversationHistoryDir = path.dirname(conversationHistoryPath);
  if (!fs.existsSync(conversationHistoryDir)) {
    await fsPromises.mkdir(conversationHistoryDir, { recursive: true });
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
  fs.writeFileSync(conversationHistoryPath, JSON.stringify(updatedHistory));

  console.log(
    `Conversation history saved. Added ${newMessages.length} new messages.`
  );

  return NextResponse.json({
    message: "Conversation history saved",
    newMessagesCount: newMessages.length,
  });
}

//get conversation history from a file
export async function GET(request: NextRequest) {
  try {
    const conversationHistoryPath = path.join(
      process.cwd(),
      "conversationHistory.json"
    );

    // Check if file exists
    if (!fs.existsSync(conversationHistoryPath)) {
      // Create an empty conversation history file
      await fsPromises.writeFile(conversationHistoryPath, JSON.stringify([]));
      return NextResponse.json([]);
    }

    // Read the conversation history
    const conversationHistory = fs.readFileSync(
      conversationHistoryPath,
      "utf8"
    );
    console.log("Conversation history retrieved");

    // Return the conversation history
    return NextResponse.json(JSON.parse(conversationHistory));
  } catch (error) {
    console.error("Error retrieving conversation history:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversation history" },
      { status: 500 }
    );
  }
}
