import MarkdownRenderer from "@/app/components/render";
import { useEffect, useState } from "react";
import { memo } from "react";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";

export const Reasoning = memo(({ content, isCollapsed, setIsCollapsed, wordCount }: { content: string, isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void, wordCount: number }) => {
    return (
        <div className="mb-6">
            <div
                className="cursor-pointer select-none"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2 text-[#2C2C2C] text-sm mb-2">
                    <span
                        className="inline-flex items-center justify-center w-4 transition-transform duration-200"
                        style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                    >
                        ▼
                    </span>
                    <span>Thinking</span>
                    <span className="text-xs bg-[#F5F5F5] px-2 py-0.5 rounded-sm">
                        {wordCount} words
                    </span>
                </div>
            </div>
            {!isCollapsed && (
                <div className="mt-4 text-[#2C2C2C]/90 text-sm pl-4 border-l-2 border-[#2C2C2C]/20 overflow-y-auto">
                    <div
                        className="prose prose-sm max-w-none">
                        <MarkdownRenderer content={content} />
                    </div>
                </div>
            )}
        </div>
    )
});

export const TextOutput = memo(({ content, thinkingVisible }: { content: string, thinkingVisible: boolean }) => {

    return (
        <div className="space-y-4">
            {thinkingVisible && <div className="h-px bg-[#2C2C2C]/10" />}
            <div className="prose prose-sm max-w-none">
                <MarkdownRenderer content={content} />
            </div>
        </div>
    )
});


export const CopyButton = memo(({ content }: { content: string }) => {

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1500);
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };
    return (
        <button
            onClick={handleCopy}
            className=" opacity-0 hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 text-xs text-[#2C2C2C]/60 hover:text-[#2C2C2C]"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-3.5 h-3.5 stroke-2"
            >
                {isCopied ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                    />
                ) : (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                )}
            </svg>
            <span className="transition-opacity">
                {isCopied ? 'Copied!' : 'Copy'}
            </span>
        </button>
    )
});


export const AdditionalInfo = memo(({ message }: { message: Message }) => {

    return (
        <button
            className=" opacity-0 hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 text-xs text-[#2C2C2C]/60 hover:text-[#2C2C2C]">
            <div>{message.additionalInfo}</div>
        </button>
    )
});