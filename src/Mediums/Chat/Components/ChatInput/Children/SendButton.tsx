import { memo } from "react";

const SendButton = function SendButton({ showSendButton }: { showSendButton: boolean }) {

    return (
        <div className="transition-all duration-300 ease-out opacity-0 scale-90 origin-center"
            style={{
                opacity: showSendButton ? 1 : 0,
                transform: showSendButton ? 'scale(1)' : 'scale(0.9)',
                transitionDuration: showSendButton ? '300ms' : '150ms'
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
};

export default memo(SendButton);