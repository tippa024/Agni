import { memo } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import { MessageBubbleProps } from '@/Mediums/Chat/Utils/prompt&type';
import UserMessageinChat from './Children/UserMessage';
import SearchResultsinChat from './Children/SearchResults';
import AssistantMessageinChat from './Children/AssistantMessage/AssitantMessage';

const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

export const MessageBubble = memo(function MessageBubble({
    message,
    messageComponentIndex,
    currentProcessingStep,
}: MessageBubbleProps) {

    if (message.role === 'user') {
        return (
            <UserMessageinChat message={message} font={sourceSerif4} />
        )
    }
    if (message.sources) {
        return (
            <SearchResultsinChat sources={message.sources} />
        );
    }
    return (
        <AssistantMessageinChat message={message} messageComponentIndex={messageComponentIndex} currentProcessingStep={currentProcessingStep} font={sourceSerif4} />
    );
});