'use client';

import { useState, useEffect } from 'react';
import Text from "@/Mediums/Text/Components/text";
import { getLocation } from "./location";
import Chat from "@/Mediums/Chat/Components/chat";
import Header from "./components/Header";
import { getSupportedModels, Message, UserPreferences, costofconversation } from "@/Mediums/Chat/Utils/prompt&type";

export default function Home() {

  const [mode, setMode] = useState<'chat' | 'text'>('chat');

  const [cost, setCost] = useState<costofconversation>({ cumulative: 0, total: 0, input: [0, 0], output: [0, 0], cachewrite: [0, 0], cacheread: [0, 0] });

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    searchEnabled: false,
    context: false,
    model: getSupportedModels()[0]
  });
  const [currentProcessingStep, setCurrentProcessingStep] = useState("");
  const [locationOn, setLocationOn] = useState<boolean>(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number }>({ latitude: 13 + 22 / 60, longitude: 79 + 12 / 60 });

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

  const [text, setText] = useState('');

  return (
    <main className="flex flex-col min-h-screen w-screen bg-white overflow-hidden overflow-y-auto scrollbar-hide">
      <Header location={location} locationOn={locationOn} mode={mode} setMode={setMode} />
      {mode === 'chat' ?
        <Chat input={input} messages={messages} userPreferences={userPreferences} currentProcessingStep={currentProcessingStep} location={location} cost={cost} setMessages={setMessages} setInput={setInput} setCurrentProcessingStep={setCurrentProcessingStep} setUserPreferences={setUserPreferences} setCost={setCost} /> : (
          <div className=' bg-white'>
            <Text text={text} setText={setText} />
          </div>
        )
      }
    </main>
  );
}
