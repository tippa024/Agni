# Agni

A context-aware AI chat assistant built with Next.js 14, TypeScript, and Tailwind CSS. Features web search capabilities and streaming responses.

## Features

- Next.js 14 App Router & TypeScript
- Web Search Integration:
  - Tavily Search API
  - OpenPerplex Search API
- Real-time streaming responses
- Context-aware conversations
- Markdown rendering with code highlighting
- Responsive design

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env.local`:

```env
# Search APIs
TAVILY_API_KEY=
OPENPERPLEX_API_KEY=
```

3. Run the development server:

```bash
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── tavily/        # Tavily search and extract APIs
│   │   └── openperplex/   # OpenPerplex search API
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks for search
│   └── lib/             # Utilities and handlers
```

## Key Components

- **MessageBubble**: Renders chat messages with support for reasoning, search results, and markdown
- **ChatInput**: Handles user input with search and reasoning toggles
- **Search Integration**: Uses Tavily and OpenPerplex for web search capabilities

## Author

Tippa
