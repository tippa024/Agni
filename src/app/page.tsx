'use client';

import { useState, useRef, useEffect } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import { MessageBubble } from './components/MessageBubble';
import { UserInput } from './lib/handlers/UserInput';
import { handleRawUserInput } from './lib/handlers/MasterHandler';
import { systemMessage } from './lib/utils/promt';
import { Message, UserPreferences } from './lib/utils/type';


const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});


export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProcessingStep, setCurrentProcessingStep] = useState<string>('');

  // Group user preferences into a single object
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    searchEnabled: false,
    model: ["gpt-4o-mini", "OpenAI"] as ["gpt-4o-mini", "OpenAI"] | ["claude-3-5-haiku", "Anthropic"],
  });

  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([systemMessage]);

  const onSubmit = async (e: React.FormEvent) => {
    await handleRawUserInput(
      e,
      // State object
      {
        input,
        messages,
        userPreferences,
        currentProcessingStep,
        conversationHistory,
      },
      // Actions object
      {
        setMessages,
        setInput,
        setCurrentProcessingStep,
        setConversationHistory,
      }
    );
  };

  //ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
                userPreferences={userPreferences}
                font={sourceSerif4}
                handleSubmit={onSubmit}
                setInput={setInput}
                setUserPreferences={setUserPreferences}
              />
            </div>
          </div>
        </div>
      ) : (
        // Regular chat layout
        <div className="flex flex-col h-screen">
          <div className="flex-1 w-full max-w-3xl mx-auto px-4 overflow-hidden overflow-wrap-break-word">
            <div className="h-full py-4  overflow-y-auto scrollbar-hide">
              <div className="space-y-4 pb-2 rounded-lg">
                {messages.map((message, index) => (
                  <div key={index}>
                    <MessageBubble
                      messageComponentIndex={index}
                      message={message}
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
                userPreferences={userPreferences}
                font={sourceSerif4}
                handleSubmit={onSubmit}
                setInput={setInput}
                setUserPreferences={setUserPreferences}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
