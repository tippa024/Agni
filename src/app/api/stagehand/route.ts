import { NextResponse } from "next/server";
import { main } from "@/app/lib/handlers/2.Agents/TwitterHandler";

export async function POST() {
  try {
    const results = await main({});
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
}
