# Agni

A session only chat application built with Next.js 14 App Router that supports multiple AI models and search.

## Features

- **Multiple AI Models Support**

  - OpenAI GPT-4o Mini
  - Anthropic Claude 3.5 Haiku
  - Easy model switching in the UI

- **Real-time Streaming**

  - Instant response streaming from both models
  - Smooth message updates with proper state management

- **Web Search Integration**
  - Optional web search capability
  - Query refinement using OpenAI
  - Search results incorporated into AI responses

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── Anthropic/
│   │   │   └── route.ts         # Anthropic API endpoint
│   │   ├── OpenAI/
│   │   │   ├── Chat/
│   │   │   │   └── route.ts     # OpenAI chat endpoint
│   │   │   └── SearchQueryRefinement/
│   │   │       └── route.ts     # Query refinement endpoint
│   │   └── OpenPerplex/         # Search API integration
│   ├── components/
│   │   └── MessageBubble.tsx    # Message display component
│   └── lib/
│       ├── handlers/
│       │   ├── MasterHandler.ts  # Main chat orchestration
│       │   ├── UserInput.tsx     # Chat input with model selection
│       │   ├── 1.UnderstandUserInput/
│       │   │   └── UnderstandUserInputHandler.ts
│       │   ├── 2.Search/
│       │   │   └── SearchHandler.ts
│       │   └── 3.Output/
│       │       └── FinalResponseHandler.ts
│       └── utils/
│           ├── type.ts          # Shared TypeScript interfaces
│           └── promt.ts         # System prompts and configurations (play around with prompts here)
```

## Architecture

- **Handler Chain**

  1. MasterHandler orchestrates the chat flow
  2. UnderstandUserInput processes initial queries
  3. Search handles web queries when enabled
  4. FinalResponse manages model responses and streaming

- **Type Safety**
  - Centralized type definitions in `type.ts`
  - Shared interfaces for messages and user preferences
  - Strong typing for model selections and API responses

## Usage

1. Switch between models using the toggle in the chat input
2. Enable/disable web search as needed
3. Messages stream in real-time with proper formatting
4. Search results are incorporated when search is enabled

## Environment Variables

```env
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
OPENPERPLEX_API_KEY=your_search_key
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)
