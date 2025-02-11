import { NextRequest } from "next/server";

// Validate API key at startup
const apiKey = process.env.OPENPERPLEX_API_KEY;
if (!apiKey) {
  throw new Error("OPENPERPLEX_API_KEY is not configured");
}

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const refinedsearchdata = await request.json();
    //console.log("Received search data:", refinedsearchdata);

    // Process parameters
    const params = {
      query: refinedsearchdata.query,
      return_citations: String(refinedsearchdata.return_citations),
      return_sources: String(refinedsearchdata.return_sources),
      verbose_mode: String(refinedsearchdata.verbose_mode),
      search_type: refinedsearchdata.search_type,
      answer_type: refinedsearchdata.answer_type,
      response_language: refinedsearchdata.response_language,
      pro_mode: String(refinedsearchdata.pro_mode),
      location: refinedsearchdata.location,
      date_context: refinedsearchdata.date_context,
    };

    const queryString = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            String(value)
          ).replace(/\+/g, "%20")}`
      )
      .join("&");

    console.log("Final query string:", queryString);

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
    return Response.json(data);
  } catch (error: any) {
    console.error("OpenPerplex Search Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Search failed" }),
      { status: 500 }
    );
  }
}
