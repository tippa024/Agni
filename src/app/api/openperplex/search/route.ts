import { NextRequest } from "next/server";
import { OpenPerplexSearchParameters } from "@/Search/Utils/OpenPerplex/prompt&type";

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

    const params: OpenPerplexSearchParameters = {
      query: searchdata.query,
      return_citations: Boolean(searchdata.return_citations),
      return_sources: Boolean(searchdata.return_sources),
      search_type: searchdata.search_type,
      answer_type: searchdata.answer_type,
      response_language: searchdata.response_language,
      model: searchdata.model,
      location: searchdata.location,
      date_context: searchdata.date_context,
      return_images: Boolean(searchdata.return_images),
      recency_filter: searchdata.recency_filter,
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
