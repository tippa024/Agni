import { modeloptionsforprovider } from "@/Mediums/Chat/Utils/prompt&type";

export const anthropicModelDetails: modeloptionsforprovider[] = [
  {
    name: "3.7 Sonnet",
    apiCallName: "claude-3-7-sonnet-20250219",
    reasoning: true,
    pricing: {
      input: 3,
      cachewrite: 3.75,
      cacheread: 0.3,
      output: 15,
    },
  },
  {
    name: "3.5 Sonnet",
    apiCallName: "claude-3-5-sonnet-20241022",
    reasoning: false,
    pricing: {
      input: 3,
      cachewrite: 3.75,
      cacheread: 0.3,
      output: 15,
    },
  },
  {
    name: "3.5 Haiku",
    apiCallName: "claude-3-5-haiku-20241022",
    reasoning: false,
    pricing: {
      input: 0.8,
      cachewrite: 1,
      cacheread: 0.08,
      output: 4,
    },
  },
];
