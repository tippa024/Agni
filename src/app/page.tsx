'use client';

import { useState, useRef, useEffect } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import { MessageBubble } from "./components/MessageBubble/MessageBubble";
import { UserInput } from "./components/ChatInput/ChatInput";
import TextInput from "./components/TextInput/TextInput";
import { handleRawUserInput } from "../Mediums/Chat/master";
import { ChatState, Message, UserPreferences, conversationHistory } from "../Mediums/Chat/Utils/prompt&type";
import { conversationHistoryAPI } from "@/Context/Utils/ConversationHistory/apiCall";
import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
import { SynthesizeAPI } from "@/Context/Utils/Synthesize/apiCall";
import { getLocation } from "./location";


const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});


export default function Home() {
  const [mode, setMode] = useState<'chat' | 'text'>('chat');

  const [chatState, setChatState] = useState<ChatState>({
    input: '',
    messages: [] as Message[],
    currentProcessingStep: '',
    userPreferences: {
      searchEnabled: false,
      context: true,
      model: ["gpt-4o-mini", "OpenAI"] as ["gpt-4o-mini", "OpenAI"] | ["claude-3-5-haiku-20241022", "Anthropic"] | ["claude-3-5-sonnet-20241022", "Anthropic"],
    },
    conversationHistory: [] as conversationHistory[],
    location: { latitude: 0, longitude: 0 },
  });

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProcessingStep, setCurrentProcessingStep] = useState<string>('');

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    searchEnabled: false,
    context: true,
    model: ["gpt-4o-mini", "OpenAI"] as ["gpt-4o-mini", "OpenAI"] | ["claude-3-5-haiku-20241022", "Anthropic"] | ["claude-3-5-sonnet-20241022", "Anthropic"],
  });

  const [conversationHistory, setConversationHistory] = useState<conversationHistory[]>([]);
  const [locationOn, setLocationOn] = useState<boolean>(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const userLocation = await getLocation();
      if (userLocation) {
        setLocation(userLocation);
        setLocationOn(true);
      } else {
        console.log("Could not get user location");
        setLocationOn(false);
      }
    };
    fetchLocation();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    await handleRawUserInput(
      e,
      {
        input,
        messages,
        userPreferences,
        currentProcessingStep,
        conversationHistory,
        location: location ? location : { latitude: 0, longitude: 0 },
      },
      {
        setMessages,
        setInput,
        setCurrentProcessingStep,
        setConversationHistory,
      }
    );
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="flex flex-col min-h-screen w-screen bg-white">
      <div className='flex justify-between items-center border'>
        <div className='flex-1 flex justify-start'>
          <button
            onClick={() => getLocation()}
            className={`px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 text-[#4A4235] font-medium text-sm ${locationOn ? 'opacity-80' : 'opacity-20'}`}>
            Location
          </button>
        </div>
        <div className='flex'>
        </div>
        <div suppressHydrationWarning className='text-sm text-[#4A4235] text-center flex-1 font-mono opacity-25'>
          {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className='flex-1 flex justify-end'>
          <button
            onClick={() => setMode(mode === 'chat' ? 'text' : 'chat')}
            className="px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 text-[#4A4235] font-medium text-sm">
            {mode === 'chat' ? 'TEXT' : 'CHAT'}
          </button>
        </div>
      </div>
      {mode === 'chat' ? (
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
          (<div className="flex flex-col h-screen">
            <div className='flex justify-between'>
              <div className='flex justify-start'>
                <button className='bg-[#4A4235] text-white px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 font-medium text-sm'
                  onClick={async () => {
                    const context = await SynthesizeAPI.ConversationToMarkDown(conversationHistory, "claude-3-5-sonnet-20241022", "Anthropic");
                    if (context) {
                      await MarkdownAPI.WriteNewToContext(context.filename, context.markdown);
                    }
                    conversationHistoryAPI.addNewMessages(conversationHistory);
                  }}
                >
                  Save
                </button>
              </div>
              <div className='flex justify-end'>
                <button className={`bg-[#4A4235] text-white px-3 py-1.5 transition-colors duration-200 font-medium text-sm
                 ${userPreferences.context ? 'opacity-80' : 'opacity-20'}`}
                  onClick={() => {
                    setUserPreferences({ ...userPreferences, context: !userPreferences.context });
                  }}
                >
                  Context
                </button>
              </div>
            </div>
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
          </div>)
        )

      ) : (
        <div className='h-screen w-full bg-white'>
          <TextInput />
        </div>
      )
      }
    </main>
  );
}
