import CurrentStepAndTime from "../CurrentStep&Time";
import { Reasoning, TextOutput, CopyButton } from "./Children";
import { useEffect, useState } from "react";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";


const AssistantMessageinChat = function AssistantMessageinChat({ message, messageComponentIndex, currentProcessingStep, font }: { message: Message, messageComponentIndex: number, currentProcessingStep: string | undefined, font: { className: string } }) {

    const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(true);
    const [segmentedMessageContent, setSegmentedMessageContent] = useState<{ thinking?: string; answer?: string }>({});
    const [wordCount, setWordCount] = useState(0);
    const isAssistant = message.role === 'assistant';


    useEffect(() => {
        if (isAssistant && message.content) {

            const parts = message.content.split(/\n*Reasoning:\s*|\n*Answer:\s*/);

            setSegmentedMessageContent({
                thinking: parts.length > 1 ? parts[1] : '',
                answer: parts[parts.length - 1]
            });
            setWordCount(message.content.split(/\s+/).length);
        }
    }, [message.content, isAssistant]);

    return (
        <div className="flex justify-start">
            <div className=" w-[100%] rounded-sm pr-8 pl-2 py-4  border-white border-4">
                <CurrentStepAndTime messageComponentIndex={messageComponentIndex} currentProcessingStep={currentProcessingStep} font={font} timestamp={message.timestamp} />


                {segmentedMessageContent.thinking && (
                    <Reasoning content={segmentedMessageContent.thinking} isCollapsed={isThinkingCollapsed} setIsCollapsed={setIsThinkingCollapsed} wordCount={wordCount} />
                )}

                {segmentedMessageContent.answer &&
                    (
                        <div>
                            <TextOutput content={segmentedMessageContent.answer} thinkingVisible={segmentedMessageContent.thinking ? true : false} />
                            <CopyButton content={segmentedMessageContent.answer} />
                        </div>
                    )
                }
            </div>
        </div>
    )
}


export default AssistantMessageinChat;