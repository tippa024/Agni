import { getLocation } from "../location";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
export default function Header({ locationOn, mode, setMode, location }: { locationOn: boolean, mode: string, setMode: Dispatch<SetStateAction<"chat" | "text">>, location: { latitude: number, longitude: number } }) {

    const [time, setTime] = useState(new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className='flex justify-between items-center border'>
            <div className='flex-1 flex justify-start'>
                <button
                    onClick={() => {
                        getLocation();
                        if (locationOn) {
                            window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
                        }
                    }}
                    className={`px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 text-[#4A4235]  text-sm ${locationOn ? 'font-mono' : 'font-medium'}`}>
                    {locationOn ? `${location.latitude.toFixed(2)}°N ${location.longitude.toFixed(2)}°E` : 'Location'}
                </button>
            </div>
            <div className='flex'>
            </div>
            <div suppressHydrationWarning className='text-sm text-[#4A4235] text-center flex-1 font-mono opacity-25'>
                {time}
            </div>
            <div className='flex-1 flex justify-end'>
                <button
                    onClick={() => setMode(mode === 'chat' ? 'text' : 'chat')}
                    className="px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 text-[#4A4235] font-medium text-sm">
                    {mode === 'chat' ? 'TEXT' : 'CHAT'}
                </button>
            </div>
        </div>
    )
}