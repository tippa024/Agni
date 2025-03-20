'use client';

import { useState, useEffect } from 'react';
import Text from "@/Mediums/Text/Components/text";
import { getLocation } from "./location";
import Chat from "@/Mediums/Chat/Components/chat";
import Header from "./components/Header";


export default function Home() {
  const [mode, setMode] = useState<'chat' | 'text'>('chat');
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
    <main className="flex flex-col min-h-screen w-screen bg-white">
      <Header locationOn={locationOn} mode={mode} setMode={setMode} />
      {mode === 'chat' ? <Chat location={location} /> : (
        <div className='h-screen w-full bg-white'>
          <Text />
        </div>
      )
      }
    </main>
  );
}
