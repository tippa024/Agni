'use client';

import { useState, useEffect } from 'react';
import Text from "@/Mediums/Text/Components/text";
import { getLocation } from "./location";
import Chat from "@/Mediums/Chat/Components/chat";
import Header from "./components/Header";
import { getSupportedModels, Message, UserPreferences } from "@/Mediums/Chat/Utils/prompt&type";

console.log("Page Rendered");

export default function Home() {
  const [mode, setMode] = useState<'chat' | 'text'>('chat');

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    searchEnabled: false,
    context: false,
    model: getSupportedModels()[0]
  });
  const [currentProcessingStep, setCurrentProcessingStep] = useState("");



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
      {mode === 'chat' ? <Chat input={input} messages={messages} userPreferences={userPreferences} currentProcessingStep={currentProcessingStep} location={location} setMessages={setMessages} setInput={setInput} setCurrentProcessingStep={setCurrentProcessingStep} setUserPreferences={setUserPreferences} /> : (
        <div className=' bg-white'>
          <Text />
        </div>
      )
      }
    </main>
  );
}
