'use client';

import { useState, useRef, useEffect } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import { MessageBubble } from './components/MessageBubble';
import { UserInput } from './lib/handlers/UserInput';
import { handleRawUserInput } from './lib/handlers/MasterHandler';
import { systemMessage } from './lib/utils/promt';
import { Message, UserPreferences } from './lib/utils/type';
import Markdown from 'react-markdown';
import MarkdownRenderer from './lib/utils/render';


const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});


export default function Home() {
  const [chatMode, setChatMode] = useState<'chat' | 'text'>('chat');
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProcessingStep, setCurrentProcessingStep] = useState<string>('');

  // Group user preferences into a single object
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    searchEnabled: false,
    model: ["gpt-4o-mini", "OpenAI"] as ["gpt-4o-mini", "OpenAI"] | ["claude-3-5-haiku-20241022", "Anthropic"] | ["claude-3-5-sonnet-20241022", "Anthropic"],
  });

  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([systemMessage]);

  const onSubmit = async (e: React.FormEvent) => {
    await handleRawUserInput(
      e,
      {
        input,
        messages,
        userPreferences,
        currentProcessingStep,
        conversationHistory,
      },
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
    <main className="flex flex-col min-h-screen w-screen bg-white">
      <div className='flex justify-between items-center'>
        <div className='flex-1'></div>
        <div className='text-sm text-[#4A4235] text-center flex-1 font-mono opacity-25'>
          {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className='flex-1 flex justify-end'>
          <button
            onClick={() => setChatMode(chatMode === 'chat' ? 'text' : 'chat')}
            className="px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 text-[#4A4235] font-medium text-sm">
            {chatMode === 'chat' ? 'TEXT' : 'CHAT'}
          </button>
        </div>
      </div>


      {chatMode === 'chat' ? (
        messages.length === 0 ? (
          <div className=" w-full  flex flex-col min-h-[90vh] items-center justify-center p-4">
            <div className=" max-w-3xl w-full transform transition-all duration-300 ease-in-out">
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
        )

      ) : (
        <div className='flex flex-col items-center'>
          <textarea
            className="w-2/3 mx-auto p-4 rounded-lg resize-none focus:outline-none focus:ring-0 bg-white min-h-[100px]"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing..."
            style={{ overflowY: 'auto' }}
          />
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={async () => {
              try {
                const response = await fetch('/api/saveMarkdown', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ content: text }),
                });

                if (response.ok) {
                  alert('File saved successfully to context folder!');
                } else {
                  const error = await response.text();
                  alert(`Error saving file: ${error}`);
                }
              } catch (error) {
                console.error('Error saving markdown file:', error);
                alert('Failed to save file. Check console for details.');
              }
            }}
          >
            Save to Context
          </button>
          <div className='prose prose-sm max-w-3xl'>
            <MarkdownRenderer content={text} />
          </div>
        </div>
      )
      }
    </main>
  );
}
