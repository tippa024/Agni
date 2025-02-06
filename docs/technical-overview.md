# Technical Documentation

## Project Overview

A context-aware AI chat application built with Next.js 14, featuring web search capabilities and streaming responses. The application uses Tavily and OpenPerplex for web search integration.

## Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Search APIs**:
  - Tavily (primary search + content extraction)
  - OpenPerplex (alternative search with built-in LLM responses)

### Directory Structure

```
src/
├── app/
│   ├── api/                 # API route handlers
│   │   ├── tavily/         # Tavily search and extract endpoints
│   │   └── openperplex/    # OpenPerplex search endpoint
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   └── lib/              # Utility functions and handlers
```

## Core Components

### ChatInput Component

- Handles user input and submission
- Manages search and reasoning toggles
- Supports switching between search providers

### MessageBubble Component

- Renders different message types (user/assistant)
- Handles markdown formatting
- Displays search results and sources
- Features collapsible reasoning sections
- Implements copy functionality

## Key Logic Flows

### Chat Submission Process

1. **Query Refinement**

   - Optimizes user query for search relevance
   - Customizes search parameters based on provider

2. **Search Process**

   ```typescript
   if (searchProvider === "tavily") {
     // Execute search
     // Extract content from top results
     // Process extracted content
   } else {
     // Use OpenPerplex for combined search + LLM response
   }
   ```

3. **Response Generation**
   - Streams response in real-time
   - Formats content with reasoning (if enabled)
   - Updates chat history

### Search Integration

#### Tavily Search

- Primary search provider
- Supports advanced search options
- Includes content extraction capability
- Configuration options:
  ```typescript
  {
    searchDepth: "basic" | "advanced";
    topic: "general" | "news";
    maxResults: number; // 1-10
    includeAnswer: boolean;
  }
  ```

#### OpenPerplex Search

- Alternative search provider
- Includes built-in LLM response
- Simpler configuration:
  ```typescript
  {
    maxResults: number; // 1-10
  }
  ```

## State Management

### Chat State

- Messages array
- Search results
- Loading states
- Provider selection
- Feature toggles (search/reasoning)

### Search State

- Current results
- Loading states
- Error handling
- Extraction status

## API Routes

### /api/tavily/search

- Handles search requests
- Implements timeout protection
- Includes error handling and logging

### /api/tavily/extract

- Processes content extraction
- Limits URL count (max 20)
- Handles extraction errors

### /api/openperplex/search

- Combines search and LLM response
- Transforms response format
- Includes metadata handling

## Error Handling

- API request failures
- Search timeouts
- Content extraction issues
- Stream processing errors
- Response parsing failures

## Performance Considerations

- Streaming responses for real-time feedback
- Optimized search result processing
- Efficient content extraction
- Response caching (where applicable)

## Environment Configuration

Required environment variables:

```env
TAVILY_API_KEY=
OPENPERPLEX_API_KEY=
```

## Future Improvements

1. Response caching system
2. Enhanced error recovery
3. Additional search providers
4. Advanced content extraction options
5. User preference persistence
