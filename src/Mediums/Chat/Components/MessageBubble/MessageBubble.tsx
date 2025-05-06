import { Source_Serif_4 } from 'next/font/google';
import { MessageBubbleProps } from '@/Mediums/Chat/Utils/prompt&type';
import UserMessageinChat from './Children/UserMessage';
import AssistantMessageinChat from './Children/AssistantMessage/AssitantMessage';
import AssistantMessageHeader from './Children/CurrentStep&Time';
import { memo } from 'react';
const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

const MessageBubble = function MessageBubble({
    message,
    messageComponentIndex,
    currentProcessingStep,
    cost
}: MessageBubbleProps) {

    if (message.role === 'user') {
        return (
            <UserMessageinChat message={message} font={sourceSerif4} />
        )
    }
    if (message.role === 'assistant') {
        return (
            <>
                <AssistantMessageHeader messageComponentIndex={messageComponentIndex} currentProcessingStep={currentProcessingStep} font={sourceSerif4} timestamp={message.timestamp} cost={cost.total} />
                <AssistantMessageinChat message={message} />
            </>
        );
    }

};

export default memo(MessageBubble);