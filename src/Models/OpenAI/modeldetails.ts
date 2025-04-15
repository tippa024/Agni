import { modeloptionsforprovider } from "@/Mediums/Chat/Utils/prompt&type";

export const openaiModelDetails: modeloptionsforprovider[] = [
  {
    name: "4o-Mini",
    apiCallName: "gpt-4o-mini-2024-07-18",
    reasoning: false,
    pricing: {
      input: 0.15,
      cachewrite: 0.075,
      cacheread: 0.075,
      output: 0.6,
    },
  },
  {
    name: "4.1-Mini",
    apiCallName: "gpt-4.1-mini-2025-04-14",
    reasoning: false,
    pricing: {
      input: 0.4,
      cachewrite: 0.1,
      cacheread: 0.1,
      output: 1.6,
    },
  },
  {
    name: "4.1",
    apiCallName: "gpt-4.1-2025-04-14",
    reasoning: false,
    pricing: {
      input: 2,
      cachewrite: 0.5,
      cacheread: 0.5,
      output: 8,
    },
  },
  {
    name: "4.1-Nano",
    apiCallName: "gpt-4.1-nano-2025-04-14",
    reasoning: false,
    pricing: {
      input: 0.1,
      cachewrite: 0.025,
      cacheread: 0.025,
      output: 0.4,
    },
  },
  {
    name: "4o",
    apiCallName: "gpt-4o-2024-08-06",
    reasoning: false,
    pricing: {
      input: 2.5,
      cachewrite: 1.25,
      cacheread: 1.25,
      output: 10.0,
    },
  },

  {
    name: "o1",
    apiCallName: "o1-2024-12-17",
    reasoning: true,
    pricing: {
      input: 15.0,
      cachewrite: 7.5,
      cacheread: 7.5,
      output: 60.0,
    },
  },
  {
    name: "o3-mini",
    apiCallName: "o3-mini-2025-01-31",
    reasoning: true,
    pricing: {
      input: 1.1,
      cachewrite: 0.55,
      cacheread: 0.55,
      output: 4.4,
    },
  },
];
