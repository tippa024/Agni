import { memo } from "react";

export const SendButton = memo(function SendButton({ input }: { input: string }) {
    return (
        <div className="transition-all duration-300 ease-out opacity-0 scale-90 origin-center"
            style={{
                opacity: input.trim() ? 1 : 0,
                transform: input.trim() ? 'scale(1)' : 'scale(0.9)',
                transitionDuration: input.trim() ? '300ms' : '150ms'
            }}>
            <button
                type="submit"
                className="mr-3 p-2.5 rounded-xl transition-all text-white bg-[#4A4235] hover:bg-[#4A4235]/90 active:scale-95 shadow-sm"
            >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
});