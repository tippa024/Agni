
import { Source_Serif_4 } from 'next/font/google';
import { MessageBubbleProps } from '@/Mediums/Chat/Utils/prompt&type';
import UserMessageinChat from './Children/UserMessage';
import AssistantMessageinChat from './Children/AssistantMessage/AssitantMessage';
import CurrentStepAndTime from './Children/CurrentStep&Time';
import { memo, useEffect, useState } from 'react';
const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

const MessageBubble = function MessageBubble({
    message,
    messageComponentIndex,
    currentProcessingStep,
}: MessageBubbleProps) {
    const [prevMessage, setPrevMessage] = useState(message);
    const [prevProcessingStep, setPrevProcessingStep] = useState(currentProcessingStep);
    const [prevMessageComponentIndex, setPrevMessageComponentIndex] = useState(messageComponentIndex);
    const [renderCount, setRenderCount] = useState(0);


    useEffect(() => {
        if (message !== prevMessage) {
            setPrevMessage(message);
        } else if (currentProcessingStep !== prevProcessingStep) {
            setPrevProcessingStep(currentProcessingStep);
        } else if (messageComponentIndex !== prevMessageComponentIndex) {
            setPrevMessageComponentIndex(messageComponentIndex);
        } else {
            console.log("Message Bubble Rendered due to parent re-render or prop reference change:", Date.now());
        }
        setRenderCount(prev => prev + 1);
    }, [message, currentProcessingStep, messageComponentIndex, prevMessage, prevProcessingStep, prevMessageComponentIndex]);



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