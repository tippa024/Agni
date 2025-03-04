import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { content } = data;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Create the context directory if it doesn't exist
    const contextDir = path.join(process.cwd(), "context");
    if (!fs.existsSync(contextDir)) {
      fs.mkdirSync(contextDir, { recursive: true });
    }

    // Generate a filename with date and time
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `context-${timestamp}.md`;
    const filePath = path.join(contextDir, filename);

    // Write the file
    fs.writeFileSync(filePath, content);

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Error saving markdown:", error);
    return NextResponse.json(
      { error: "Failed to save markdown file" },
      { status: 500 }
    );
  }
}
