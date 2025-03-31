'use client';

import { useState, useEffect } from 'react';
import Text from "@/Mediums/Text/Components/text";
import { getLocation } from "./location";
import Chat from "@/Mediums/Chat/Components/chat";
import ChatBackUp from "./components/Chat_BackUp/Chat";
import Header from "./components/Header";

import { ChatState, ChatActions, UserPreferences, Message, conversationHistory } from "@/Mediums/Chat/Utils/prompt&type";


export default function Home() {
  const [mode, setMode] = useState<'chat' | 'text'>('chat');

  const [chatState, setChatState] = useState<ChatState>({
    input: "",
    messages: [],
    userPreferences: {
      searchEnabled: false,
      context: false,
      model: ["gpt-4o-mini", "OpenAI"] as ["gpt-4o-mini", "OpenAI"] | ["claude-3-5-haiku-20241022", "Anthropic"] | ["claude-3-5-sonnet-20241022", "Anthropic"],
    },
    currentProcessingStep: "",
    conversationHistory: [],
    location: { latitude: 0, longitude: 0 },
  });

  const chatActions: ChatActions = {
    setMessages: (messages) => setChatState(prevState => ({
      ...prevState,
      messages: typeof messages === 'function' ? messages(prevState.messages) : messages
    })),
    setInput: (input) => setChatState(prevState => ({
      ...prevState,
      input
    })),
    setCurrentProcessingStep: (step) => setChatState(prevState => ({
      ...prevState,
      currentProcessingStep: step
    })),
    setConversationHistory: (history) => setChatState(prevState => ({
      ...prevState,
      conversationHistory: typeof history === 'function' ? history(prevState.conversationHistory) : history
    })),
    setUserPreferences: (prefs) => setChatState(prevState => ({
      ...prevState,
      userPreferences: typeof prefs === 'function' ? prefs(prevState.userPreferences) : prefs
    }))
  };

  const [text, setText] = useState("");

  const [locationOn, setLocationOn] = useState<boolean>(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number }>({ latitude: 0, longitude: 0 });

  useEffect(() => {
    const fetchLocation = async () => {
      const userLocation = await getLocation();
      if (userLocation) {
        setLocation(userLocation);
        setChatState({ ...chatState, location: userLocation });
        setLocationOn(true);
      } else {
        console.log("Could not get user location");
        setLocationOn(false);
      }
    };
    fetchLocation();
  }, []);

  return (
    <main className="flex flex-col min-h-screen w-screen bg-white">
      <Header location={location} locationOn={locationOn} mode={mode} setMode={setMode} />
      {mode === 'chat' ? <Chat chatState={chatState} chatActions={chatActions} /> : (
        <div className=' bg-white'>
          <Text text={text} setText={setText} />
        </div>
      )
      }
    </main>
  );
}
