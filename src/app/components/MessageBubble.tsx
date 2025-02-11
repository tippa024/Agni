import { useState, useEffect, memo, useRef } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import { formatOutput } from '../lib/utils/outputFormatter';

const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});



interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

interface MessageBubbleProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    messageIndex: number;
    additionalInfo?: {
        WebsiteLinks?: SearchResult[];
        Context?: string;
    };
    currentProcessingStep?: string;
    userPreferences?: {
        searchEnabled: boolean;
        reasoningEnabled: boolean;
        model: string;
    };
}

console.log("MessageBubble re-rendered");

let count = 0;



// Memoize MessageBubble since it only needs to re-render when its props change
export const MessageBubble = memo(function MessageBubble({
    role,
    content,
    messageIndex,
    additionalInfo,
    currentProcessingStep,
    userPreferences = {
        searchEnabled: false,
        reasoningEnabled: false,
        model: 'gpt-4o-mini',
    }
}: MessageBubbleProps) {

    count++;

    //console.log("content", content);
    //console.log("the number of times this funtion was used", count);
    //console.log("currentProcessingStep", currentProcessingStep);


    const [showAllSources, setShowAllSources] = useState(false);
    const [isReasoningCollapsed, setIsReasoningCollapsed] = useState(true);
    const [messageContent, setMessageContent] = useState<{ reasoning?: string; answer?: string }>({});
    const [wordCount, setWordCount] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const isAssistant = role === 'assistant';

    // Use ref to persist count between renders
    const effectRunCount = useRef(0);

    // Parse content sections
    useEffect(() => {
        if (isAssistant && content) {

            effectRunCount.current += 1;  // Increment the ref value

            console.log(`content on run #${effectRunCount.current} for message ${messageIndex}:`, content);

            // Clean the content by removing JSON-like formatting
            const cleanContent = content.replace(/(?:\d+:"([^"]+)"\s*(?:↵)?)+/g, '$1 ');

            // Split into reasoning and answer if needed
            const parts = content.split(/\n*Reasoning:\s*|\n*Answer:\s*/);

            setMessageContent({
                reasoning: parts.length > 1 ? formatOutput(parts[1]) : '',
                answer: formatOutput(parts[parts.length - 1])
            });
            console.log("messageContent from messagebubble", messageContent);

            // Calculate word count
            setWordCount(content.split(/\s+/).length);
        }
    }, [content, isAssistant, messageIndex]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };

    // User message
    if (!isAssistant) {

        return (
            <div className="flex justify-end mb-4">
                <div className="max-w-2xl px-4 py-2">
                    <div className={`${sourceSerif4.className} text-[#4A4235] text-base`}>{content}</div>
                </div>
            </div>
        );
    }
    // Loading state - only show for the last assistant message
    {
        (userPreferences?.searchEnabled && currentProcessingStep === 'searching') && (
            <div className="flex items-center gap-2">
                <span className={`text-xs text-[#b3b2b0] ${sourceSerif4.className}`}>
                    "vethukutuna" {currentProcessingStep}
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
        )
    }

    // Search results message
    if (additionalInfo?.WebsiteLinks && additionalInfo.WebsiteLinks.length > 0) {
        const externalLinks = additionalInfo.WebsiteLinks;
        return (
            <div className="flex justify-start mb-8">
                <div className="w-full max-w-3xl bg-[#F5F5F5] border border-[#2C2C2C] px-4 py-3">
                    <div className="flex items-center justify-between mb-3 border-b border-[#2C2C2C] pb-2">
                        <span className="text-sm font-mono text-[#2C2C2C] uppercase">
                            Sources [{externalLinks.length}]
                        </span>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {(showAllSources ? externalLinks : externalLinks.slice(0, 3)).map((result: SearchResult, index: number) => (
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

                    {externalLinks.length > 3 && (
                        <button
                            onClick={() => setShowAllSources(!showAllSources)}
                            className="mt-3 text-xs font-mono text-[#2C2C2C]/70 hover:text-[#2C2C2C]"
                        >
                            {showAllSources ? '[ - SHOW LESS - ]' : `[ + SHOW ${externalLinks.length - 3} MORE ]`}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // No results message
    if (content === 'no-results') {
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
        <div className="flex justify-start mb-12">
            <div className="w-[90%] rounded-sm bg-white px-8 py-6 shawdow-sm border border-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-mono uppercase tracking-wide text-[#2C2C2C]">AGNI</div>
                    {currentProcessingStep && currentProcessingStep !== '' && (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs text-[#b3b2b0] ${sourceSerif4.className}`}>
                                "helloeeew" {currentProcessingStep}
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
                {messageContent.reasoning && (
                    <div className="mb-6">
                        <div
                            className="cursor-pointer select-none"
                            onClick={() => setIsReasoningCollapsed(!isReasoningCollapsed)}
                        >
                            <div className="flex items-center gap-2 text-[#2C2C2C] text-sm mb-2">
                                <span
                                    className="inline-flex items-center justify-center w-4 transition-transform duration-200"
                                    style={{ transform: isReasoningCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                                >
                                    ▼
                                </span>
                                <span>Thinking</span>
                                <span className="text-xs bg-[#F5F5F5] px-2 py-0.5 rounded-sm">
                                    {wordCount} words
                                </span>
                            </div>
                        </div>
                        {!isReasoningCollapsed && (
                            <div className="mt-4 text-[#2C2C2C]/90 text-sm pl-4 border-l-2 border-[#2C2C2C]/20 overflow-y-auto">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: messageContent.reasoning }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Answer Section */}
                {messageContent.answer && (
                    <div className="space-y-4">
                        {messageContent.reasoning && <div className="h-px bg-[#2C2C2C]/10" />}
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: messageContent.answer }}
                        />
                    </div>
                )}

                {/* Copy Button */}
                <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 text-xs text-[#2C2C2C]/60 hover:text-[#2C2C2C]"
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
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCopied ? 'Copied!' : 'Copy'}
                    </span>
                </button>
            </div>
        </div>
    );
}); 