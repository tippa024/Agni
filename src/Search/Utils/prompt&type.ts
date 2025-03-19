import { SearchResult } from "@/Mediums/Chat/Utils/prompt&type";

export interface SearchParameters {
  query: string;
  date_context?: string;
  location?: string;
  model?: string;
  response_language?: string;
  answer_type?: string;
  search_type?: string;
  return_citations?: boolean;
  return_sources?: boolean;
  return_images?: boolean;
  recency_filter?: string;
}

export interface SearchOutput {
  sources: SearchResult[];
  textOutput: string;
  responsetime?: number;
  error?: string;
}

export const contextualisedInputPromptAfterSearch =
  "Synthesis the search results and extracted content attached below to answer the user's initial question promptly. Keep as much of the original content as possible.";

export interface ModelForRefinement {
  model:
    | ["gpt-4o-mini", "OpenAI"]
    | ["claude-3-5-haiku-20241022", "Anthropic"]
    | ["gpt-4o", "OpenAI"]
    | ["claude-3-5-sonnet-20241022", "Anthropic"];
}
