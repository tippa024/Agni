'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import Text from "@/Mediums/Text/Components/text";
import { getLocation } from "./location";
import Chat from "@/Mediums/Chat/Components/chat";
import Header from "./components/Header";
import { ChatActions, ChatState, Message, UserPreferences, conversationHistory } from "@/Mediums/Chat/Utils/prompt&type";


console.log("Page Rendered");

export default function Home() {
  const [mode, setMode] = useState<'chat' | 'text'>('chat');

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    searchEnabled: false,
    context: false,
    model: ["gpt-4o-mini", "OpenAI"] as ["gpt-4o-mini", "OpenAI"] | ["claude-3-5-haiku-20241022", "Anthropic"] | ["claude-3-5-sonnet-20241022", "Anthropic"],
  });
  const [currentProcessingStep, setCurrentProcessingStep] = useState("");
  const [conversationHistory, setConversationHistory] = useState<conversationHistory[]>([]);




  const [locationOn, setLocationOn] = useState<boolean>(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number }>({ latitude: 0, longitude: 0 });

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

  return (
    <main className="flex flex-col min-h-screen w-screen bg-white overflow-hidden overflow-y-auto scrollbar-hide">
      <Header location={location} locationOn={locationOn} mode={mode} setMode={setMode} />
      {mode === 'chat' ? <Chat input={input} messages={messages} userPreferences={userPreferences} currentProcessingStep={currentProcessingStep} conversationHistory={conversationHistory} location={location} setMessages={setMessages} setInput={setInput} setCurrentProcessingStep={setCurrentProcessingStep} setConversationHistory={setConversationHistory} setUserPreferences={setUserPreferences} /> : (
        <div className=' bg-white'>
          <Text />
        </div>
      )
      }
    </main>
  );
}
