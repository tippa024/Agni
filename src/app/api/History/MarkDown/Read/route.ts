import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const contextDir = path.join(process.cwd(), "context");

    // Check if directory exists
    if (!fs.existsSync(contextDir)) {
      return NextResponse.json(
        { error: "No context files found" },
        { status: 404 }
      );
    }

    // Get all files in the context directory
    const files = await fsPromises.readdir(contextDir);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));

    // Get the filename from the URL if provided
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const includeContent = searchParams.get("includeContent") === "true";

    // If filename is provided, return that specific file
    if (filename) {
      const filePath = path.join(contextDir, filename);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const content = await fsPromises.readFile(filePath, "utf-8");
      return NextResponse.json({ filename, content });
    }

    // If includeContent is true, return both filenames and their contents
    if (includeContent) {
      const filesWithContent = await Promise.all(
        markdownFiles.map(async (filename) => {
          const filePath = path.join(contextDir, filename);
          const content = await fsPromises.readFile(filePath, "utf-8");
          return { filename, content };
        })
      );

      return NextResponse.json({
        files: filesWithContent,
      });
    }

    // Default case: return just the list of filenames
    return NextResponse.json({
      files: markdownFiles,
    });
  } catch (error) {
    console.error("Error reading markdown files:", error);
    return NextResponse.json(
      { error: "Failed to read markdown files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const contextDir = path.join(process.cwd(), "context");
    const filePath = path.join(contextDir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = await fsPromises.readFile(filePath, "utf-8");

    return NextResponse.json({
      success: true,
      filename,
      content,
    });
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return NextResponse.json(
      { error: "Failed to read markdown file" },
      { status: 500 }
    );
  }
}
