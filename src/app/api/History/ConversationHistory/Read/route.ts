import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

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
