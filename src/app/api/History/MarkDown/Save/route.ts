import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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

    const contextDir = path.join(process.cwd(), "context");
    if (!fs.existsSync(contextDir)) {
      await fsPromises.mkdir(contextDir, { recursive: true });
    }

    const timestamp = new Date()
      .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      .replace(/[/:\s]/g, "-");
    const filename = `context-${timestamp}.md`;
    const filePath = path.join(contextDir, filename);

    await fsPromises.writeFile(filePath, content);

    console.log(`########## File saved at: ${filePath}`);
    console.log("########## Content", content);

    return NextResponse.json({
      success: true,
      filename,
      path: filePath,
    });
  } catch (error) {
    console.error("Error saving markdown:", error);
    return NextResponse.json(
      { error: "Failed to save markdown file" },
      { status: 500 }
    );
  }
}
