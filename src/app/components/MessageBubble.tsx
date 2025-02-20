import { useState, useEffect, memo } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import MarkdownRenderer from '../lib/utils/render';
import { MessageBubbleProps, SearchResult } from '../lib/utils/type';

const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

console.log("MessageBubble re-rendered");

export const MessageBubble = memo(function MessageBubble({
    message,
    messageComponentIndex,
    currentProcessingStep,
}: MessageBubbleProps) {

    const [showAllSources, setShowAllSources] = useState(false);
    const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(true);
    const [segmentedMessageContent, setSegmentedMessageContent] = useState<{ thinking?: string; answer?: string }>({});
    const [wordCount, setWordCount] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const isAssistant = message.role === 'assistant';

    // Parse content sections
    useEffect(() => {
        if (isAssistant && message.content) {

            // Split into reasoning and answer if needed
            const parts = message.content.split(/\n*Reasoning:\s*|\n*Answer:\s*/);

            setSegmentedMessageContent({
                thinking: parts.length > 1 ? parts[1] : '',
                answer: parts[parts.length - 1]
            });

            // Calculate word count
            setWordCount(message.content.split(/\s+/).length);
        }
    }, [message.content, isAssistant]);



    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };

    // User message
    if (!isAssistant) {

        return (
            <div className="flex justify-end p-2 border-red-500">
                <div className="max-w-2xl break-words font-stretch-expanded  border-blue-500 px-4 py-2">
                    <div className={`${sourceSerif4.className} text-[#4A4235] text-base`}>{message.content}</div>
                </div>
            </div>
        );
    }

    // Search results message
    if (message.sources && message.sources.length > 0) {
        return (
            <div className="flex justify-start mb-8">
                <div className="w-full max-w-3xl bg-[#F5F5F5] border border-[#2C2C2C] px-4 py-3">
                    <div className="flex items-center justify-between mb-3 border-b border-[#2C2C2C] pb-2">
                        <span className="text-sm font-mono text-[#2C2C2C] uppercase">
                            Sources [{message.sources.length}]
                        </span>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {(showAllSources ? message.sources : message.sources.slice(0, 3)).map((result: SearchResult, index: number) => (
                            <div key={index} className="border-b border-[#2C2C2C]/20 pb-3 last:border-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-mono text-sm text-[#2C2C2C]">{index + 1}.</span>
                                    <a
                                        href={result.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-[#2C2C2C] hover:underline font-mono"
                                    >
                                        {result.title}
                                    </a>
                                </div>
                                <p className="text-sm text-[#2C2C2C]/80 pl-4 font-mono">
                                    {result.snippet}
                                </p>
                            </div>
                        ))}
                    </div>

                    {message.sources.length > 3 && (
                        <button
                            onClick={() => setShowAllSources(!showAllSources)}
                            className="mt-3 text-xs font-mono text-[#2C2C2C]/70 hover:text-[#2C2C2C]"
                        >
                            {showAllSources ? '[ - SHOW LESS - ]' : `[ + SHOW ${message.sources.length - 3} MORE ]`}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // No results message
    if (message.sources && message.sources.length === 0) {
        return (
            <div className="flex justify-start mb-8">
                <div className="w-full max-w-3xl bg-[#F5F5F5] border border-[#2C2C2C] px-4 py-3">
                    <div className="flex items-center justify-between mb-3 border-b border-[#2C2C2C] pb-2">
                        <span className="text-sm font-mono text-[#2C2C2C] uppercase">Search Results</span>
                    </div>
                    <div className="text-sm font-mono text-[#2C2C2C]/70 py-2">
                        No relevant search results found.
                    </div>
                </div>
            </div>
        );
    }

    // Regular assistant message

    return (
        <div className="flex justify-start">
            <div className=" w-[100%] rounded-sm pr-8 pl-2 py-4  border-white border-4">
                <div className="flex items-center justify-normal mb-4">
                    <div className="text-sm font-mono mr-2 font-semibold uppercase tracking-wide text-[#2C2C2C]">AGNI {messageComponentIndex}</div>
                    {
                        currentProcessingStep && currentProcessingStep !== '' &&
                        (
                            <div className="flex items-center gap-2">
                                <span className={`text-xs text-[#c5bca7] ${sourceSerif4.className}`}>
                                    {currentProcessingStep}
                                </span>
                                <span className="flex gap-1">
                                    {[0, 0.3, 0.6].map((delay) => (
                                        <span
                                            key={delay}
                                            className="h-1 w-1 rounded-full bg-[#b5b4b2] animate-pulse"
                                            style={{ animationDelay: `${delay}s` }}
                                        />
                                    ))}
                                </span>
                            </div>
                        )}
                </div>

                {/* Thinking/Reasoning Section - Only show if reasoning content exists */}
                {segmentedMessageContent.thinking && (
                    <div className="mb-6">
                        <div
                            className="cursor-pointer select-none"
                            onClick={() => setIsThinkingCollapsed(!isThinkingCollapsed)}
                        >
                            <div className="flex items-center gap-2 text-[#2C2C2C] text-sm mb-2">
                                <span
                                    className="inline-flex items-center justify-center w-4 transition-transform duration-200"
                                    style={{ transform: isThinkingCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                                >
                                    ▼
                                </span>
                                <span>Thinking</span>
                                <span className="text-xs bg-[#F5F5F5] px-2 py-0.5 rounded-sm">
                                    {wordCount} words
                                </span>
                            </div>
                        </div>
                        {!isThinkingCollapsed && (
                            <div className="mt-4 text-[#2C2C2C]/90 text-sm pl-4 border-l-2 border-[#2C2C2C]/20 overflow-y-auto">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: segmentedMessageContent.thinking }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Answer Section */}
                {segmentedMessageContent.answer &&
                    (
                        <div className="space-y-4">
                            {
                                segmentedMessageContent.thinking &&
                                <div className="h-px bg-[#2C2C2C]/10" />}
                            <div className="prose prose-sm max-w-none">
                                <MarkdownRenderer content={segmentedMessageContent.answer} />
                            </div>
                        </div>
                    )
                }

                {/* Copy Button */}
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
                    <span className="opacity-0 hover:opacity-100 transition-opacity">
                        {isCopied ? 'Copied!' : 'Copy'}
                    </span>
                </button>
            </div>
        </div>
    );
});