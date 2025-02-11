'use client';

import { useState, useRef, useEffect } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import { MessageBubble } from './components/MessageBubble';
import { UserInput } from './components/ChatInput';
import { handleRawUserInput } from './lib/handlers/chatSubmitHandler';
import { systemMessage } from './lib/utils/promt';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

interface SearchResult {
  title: string;
  link: string;
  snippet: string;

}

interface Message {
  index: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  additionalInfo?: {
    externalLinks?: SearchResult[];
    Context?: string;
  };
}


export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProcessingStep, setCurrentProcessingStep] = useState<string>('');
  const [currentSearchResults, setCurrentSearchResults] = useState<SearchResult[]>([]);

  // Group user preferences into a single object
  const [userPreferences, setUserPreferences] = useState({
    searchEnabled: false,
    reasoningEnabled: false,
    model: 'gpt-4o-mini' as '4o-mini' | 'gpt-4o' as '4o' | 'deepseek-chat' as 'deepseek-chat' | 'claude-3-5-sonnet' as 'sonnet' | 'deepseek-reasoning' as 'deepseek-reasoning',
    searchProvider: 'tavily' as 'tavily' | 'openperplex' as 'openperplex'
  });

  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([systemMessage]);

  // Helper functions to update individual preferences
  const updatePreference = (key: keyof typeof userPreferences) => (value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Destructure preferences for easier access
  const { searchEnabled, reasoningEnabled, searchProvider } = userPreferences;

  const onSubmit = async (e: React.FormEvent) => {
    await handleRawUserInput(
      e,
      // State object
      {
        messages,
        input,
        currentProcessingStep,
        currentSearchResults,
        searchEnabled,
        reasoningEnabled,
        chatHistory,
      },
      // Actions object
      {
        setMessages,
        setInput,
        setCurrentProcessingStep,
        setCurrentSearchResults,
        setChatHistory,
      }
    );
  };

  // Add ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  {/*  useEffect(() => {
    console.log("Initial system message:", systemMessage);
    if (!chatHistory.length) {
      setChatHistory([systemMessage]);
    }
  }, []); */}

  return (
    <main className="flex min-h-screen w-screen flex-col bg-white">
      {messages.length === 0 ? (
        // Initial centered layout with larger vertical spacing
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-3xl -mt-32"> {/* Negative margin to adjust visual center */}
            <h1 className={`text-4xl font-semibold text-[#4A4235] text-center mb-12 ${sourceSerif4.className}`}>
              Ask me anything
            </h1>
            <div className="transform transition-all duration-300 ease-in-out hover:scale-[1.01]">
              <UserInput
                input={input}
                searchEnabled={searchEnabled}
                reasoningEnabled={reasoningEnabled}
                searchProvider={searchProvider}
                font={sourceSerif4}
                handleSubmit={onSubmit}
                setInput={setInput}
                setSearchEnabled={(value) => updatePreference('searchEnabled')(value)}
                setReasoningEnabled={(value) => updatePreference('reasoningEnabled')(value)}
                setSearchProvider={(value) => updatePreference('searchProvider')(value)}
              />
            </div>
          </div>
        </div>
      ) : (
        // Regular chat layout
        <div className="flex flex-col h-screen">
          <div className="flex-1 w-full max-w-3xl mx-auto px-4 overflow-hidden overflow-wrap-break-word">
            <div className="h-full py-4 overflow-y-auto scrollbar-hide">
              <div className="space-y-4 pb-2 border-4 border-red-500">
                {messages.map((message, index) => (
                  <div className='border-2 border-blue-500'>
                    <MessageBubble
                      key={index}
                      messageIndex={index}
                      role={message.role}
                      content={message.content}
                      additionalInfo={message.additionalInfo}
                      currentProcessingStep={
                        message.role === 'assistant' &&
                          index === messages.length - 1 ?
                          currentProcessingStep :
                          ''
                      }
                      userPreferences={userPreferences}
                    />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 left-0 right-0 bg-white p-4 sm:pb-6 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <UserInput
                input={input}
                searchEnabled={searchEnabled}
                reasoningEnabled={reasoningEnabled}
                searchProvider={searchProvider}
                font={sourceSerif4}
                handleSubmit={onSubmit}
                setInput={setInput}
                setSearchEnabled={(value) => updatePreference('searchEnabled')(value)}
                setReasoningEnabled={(value) => updatePreference('reasoningEnabled')(value)}
                setSearchProvider={(value) => updatePreference('searchProvider')(value)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
