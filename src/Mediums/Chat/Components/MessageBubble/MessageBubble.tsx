
import { Source_Serif_4 } from 'next/font/google';
import { MessageBubbleProps } from '@/Mediums/Chat/Utils/prompt&type';
import UserMessageinChat from './Children/UserMessage';
import AssistantMessageinChat from './Children/AssistantMessage/AssitantMessage';
import CurrentStepAndTime from './Children/CurrentStep&Time';
import { memo } from 'react';
const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

const MessageBubble = function MessageBubble({
    message,
    messageComponentIndex,
    currentProcessingStep,
}: MessageBubbleProps) {


    if (message.role === 'user') {
        return (
            <UserMessageinChat message={message} font={sourceSerif4} />
        )
    }
    return (
        <>
            <CurrentStepAndTime messageComponentIndex={messageComponentIndex} currentProcessingStep={currentProcessingStep} font={sourceSerif4} timestamp={message.timestamp} />
            <AssistantMessageinChat message={message} messageComponentIndex={messageComponentIndex} currentProcessingStep={currentProcessingStep} font={sourceSerif4} />
        </>
    );

};

export default memo(MessageBubble);