import { SearchParameters } from "@/app/lib/utils/type";

export const OpenPerplexSearch = async (searchParameters: SearchParameters) => {
  console.log("OpenPerplex Search API Client - Starting", searchParameters);

  try {
    const response = await fetch(`/api/OpenPerplex/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.OPENPERPLEX_API_KEY || "",
      },
      body: JSON.stringify(searchParameters),
    });

    if (!response.ok) {
      console.log("Search failed using OpenPerplex API", response.statusText);
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const searchData = await response.json();

    if (searchData.error) {
      console.error("OpenPerplex Search API - Failed", searchData.error);
      throw new Error(searchData.error);
    }

    console.log("OpenPerplex Search API Client - Completed", searchData);

    return searchData;
  } catch (error: any) {
    console.error("Error in OpenPerplexSearch:", error);
    throw new Error(error.message || "An error occurred");
  }
};
