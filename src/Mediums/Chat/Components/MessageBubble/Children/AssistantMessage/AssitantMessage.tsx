import SearchResultsinChat from "./SearchResults";
import { Reasoning, TextOutput, CopyButton } from "./Children";
import { useCallback, useEffect, useState } from "react";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";
import { memo } from "react";



const AssistantMessageinChat = function AssistantMessageinChat({
    message,
}: {
    message: Message,
}) {

    if (message.role !== 'assistant') {
        return null;
    }

    const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(true);
    const [segmentedMessageContent, setSegmentedMessageContent] = useState<{ thinking?: string; answer?: string }>({});
    const [wordCount, setWordCount] = useState(0);

    const handleSetIsThinkingCollapsed = useCallback((value: boolean | ((prevState: boolean) => boolean)) => {
        setIsThinkingCollapsed(value);
    }, []);

    useEffect(() => {
        if (message.content) {
            const parts = message.content.split(/\n*Reasoning:\s*|\n*Answer:\s*/);
            setSegmentedMessageContent({
                thinking: parts.length > 1 ? parts[1] : undefined,
                answer: parts[parts.length - 1] || undefined
            });
            setWordCount(message.content.split(/\s+/).filter(Boolean).length);
        } else {
            setSegmentedMessageContent({});
            setWordCount(0);
        }
    }, [message.content]);

    return (
        <div className="flex flex-col justify-start">
            {message.context && message.context.sources && message.context.sources.length > 0 && <SearchResultsinChat sources={message.context.sources} />}

            {segmentedMessageContent.thinking && (
                <Reasoning
                    content={segmentedMessageContent.thinking}
                    isCollapsed={isThinkingCollapsed}
                    setIsCollapsed={handleSetIsThinkingCollapsed}
                    wordCount={wordCount} />
            )}
            {segmentedMessageContent.answer &&
                (
                    <div>
                        <TextOutput content={segmentedMessageContent.answer} thinkingVisible={!!segmentedMessageContent.thinking} />
                        <CopyButton content={segmentedMessageContent.answer} />

                    </div>
                )
            }
            {!segmentedMessageContent.thinking && !segmentedMessageContent.answer && message.content && (
                <div>
                    <TextOutput content={message.content} thinkingVisible={false} />
                    <CopyButton content={message.content} />
                </div>
            )}
        </div>
    )
}

export default memo(AssistantMessageinChat);