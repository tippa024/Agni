import { useRef, useEffect, SetStateAction, Dispatch, memo, useCallback, useMemo } from "react";
import UserInput from "./ChatInput/ChatInput";
import { UserPreferences, Message, costofconversation } from "../Utils/prompt&type";
import { handleRawUserInput } from "../master";
import { conversationHistoryAPI } from "@/Context/Utils/ConversationHistory/apiCall";
import MessageBubble from "./MessageBubble/MessageBubble";
import { Source_Serif_4 } from "next/font/google";

const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

function Chat(props: {
    input: string;
    messages: Message[];
    userPreferences: UserPreferences;
    currentProcessingStep: string;
    location: { latitude: number; longitude: number };
    cost: costofconversation
    setMessages: Dispatch<SetStateAction<Message[]>>;
    setInput: Dispatch<SetStateAction<string>>;
    setCurrentProcessingStep: Dispatch<SetStateAction<string>>;
    setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
    setCost: Dispatch<SetStateAction<costofconversation>>;
}) {

    const memoizedFont = useMemo(() => sourceSerif4, []);

    const onSubmit = useCallback(async (e: React.FormEvent) => {
        await handleRawUserInput(
            e,
            () => ({
                input: props.input,
                messages: props.messages,
                userPreferences: props.userPreferences,
                currentProcessingStep: props.currentProcessingStep,
                location: props.location ? props.location : { latitude: 0, longitude: 0 },
                cost: props.cost,
            }),
            {
                setMessages: props.setMessages,
                setCurrentProcessingStep: props.setCurrentProcessingStep,
                setUserPreferences: props.setUserPreferences,
                setCost: props.setCost,
            }
        );
    }, [props.input, props.userPreferences]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = messagesEndRef.current?.parentElement;
        if (scrollContainer) {
            const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;

            const isNewMessage = props.messages.length > 0 &&
                props.messages[props.messages.length - 1].content.trim() !== '';

            if (isAtBottom || isNewMessage) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [props.messages]);

    const handleToggleContext = useCallback(() => {
        props.setUserPreferences(prev => ({ ...prev, context: !prev.context }));
    }, [props.setUserPreferences]);

    const handleSave = useCallback(async () => {
        //const context = await SynthesizeAPI.ConversationToMarkDown(props.messages, "claude-3-5-sonnet-20241022", "Anthropic");
        //if (context) {
        //      await MarkdownAPI.WriteNewToContext(context.filename, context.markdown);
        //    }
        conversationHistoryAPI.addNewMessages(props.messages);
    }, [props.messages]);

    return (
        (
            props.messages?.length === 0 ? (
                <div className="w-full h-screen flex flex-col items-center justify-center">
                    <div className='flex justify-center mb-4'>
                        <button
                            className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 hover:scale-105
                            ${props.userPreferences.context
                                    ? 'bg-gray-200 text-black opacity-80 hover:opacity-100'
                                    : 'bg-gray-300 text-white opacity-50 hover:opacity-80'}`}
                            onClick={handleToggleContext}
                        >
                            Context
                        </button>
                    </div>
                    <div className="w-full max-w-xl">
                        <UserInput
                            input={props.input}
                            userPreferences={props.userPreferences}
                            font={memoizedFont}
                            onSubmit={onSubmit}
                            setInput={props.setInput}
                            setUserPreferences={props.setUserPreferences}
                        />
                    </div>
                </div>
            ) : (
                (<div className="flex flex-row h-screen">
                    <div className='flex h-8'>
                        <button className='bg-[#4A4235] text-white px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 font-medium text-sm'
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                    <div className="flex-1 w-full max-w-3xl mx-auto px-4 overflow-hidden overflow-wrap-break-word flex flex-col">
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto scrollbar-hide">
                                <div className="space-y-4 pb-2 rounded-lg ">
                                    {props.messages.map((message, index) => (
                                        <div key={index}>
                                            <MessageBubble
                                                messageComponentIndex={index}
                                                message={message}
                                                currentProcessingStep={
                                                    message.role === 'assistant' &&
                                                        index === props.messages.length - 1 ?
                                                        props.currentProcessingStep :
                                                        ''
                                                }
                                                cost={props.cost}
                                            />
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 sm:pb-6 border-t border-gray-200">
                            <div className="max-w-xl mx-auto">
                                <UserInput
                                    input={props.input}
                                    userPreferences={props.userPreferences}
                                    font={memoizedFont}
                                    onSubmit={onSubmit}
                                    setInput={props.setInput}
                                    setUserPreferences={props.setUserPreferences}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='flex h-8'>
                        <button className={`bg-[#4A4235] text-white px-3 py-1.5 transition-colors duration-200 font-medium text-sm
                 ${props.userPreferences.context ? 'opacity-80' : 'opacity-20'}`}
                            onClick={handleToggleContext}
                        >
                            Context
                        </button>
                    </div>
                </div>)
            )
        )
    )
}

export default memo(Chat);