import { NextRequest } from "next/server";
import { OpenPerplexSearchParameters } from "@/app/lib/utils/OpenPerplex/Search/prompt&type";

// Validate API key at startup
const apiKey = process.env.OPENPERPLEX_API_KEY;
if (!apiKey) {
  throw new Error("OPENPERPLEX_API_KEY is not configured");
}

export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("OpenPerplex Search API Route - Starting");

  try {
    const searchdata = await request.json();

    console.log("OpenPerplex Search API Route - Received search data");

    const parsedSearchdata = JSON.parse(searchdata);

    console.log("OpenPerplex Search API Route - Parsed search data");

    const params: OpenPerplexSearchParameters = {
      query: parsedSearchdata.query,
      return_citations: Boolean(parsedSearchdata.return_citations),
      return_sources: Boolean(parsedSearchdata.return_sources),
      search_type: parsedSearchdata.search_type,
      answer_type: parsedSearchdata.answer_type,
      response_language: parsedSearchdata.response_language,
      model: parsedSearchdata.model,
      location: parsedSearchdata.location,
      date_context: parsedSearchdata.date_context,
      return_images: Boolean(parsedSearchdata.return_images),
      recency_filter: parsedSearchdata.recency_filter,
    };

    const queryString = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            String(value)
          ).replace(/\+/g, "%20")}`
      )
      .join("&");

    console.log(
      "OpenPerplex Search API Route - Final query string:",
      queryString
    );

    const response = await fetch(
      `https://44c57909-d9e2-41cb-9244-9cd4a443cb41.app.bhs.ai.cloud.ovh.net/search?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": apiKey as string,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenPerplex API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `OpenPerplex API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("OpenPerplex Search API Route - Completed");

    return Response.json(data);
  } catch (error: any) {
    console.error("OpenPerplex Search Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Search failed" }),
      { status: 500 }
    );
  }
}
