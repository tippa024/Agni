import { useRef, useEffect, useState, SetStateAction, Dispatch, memo, useCallback } from "react";
import UserInput from "./ChatInput/ChatInput";
import { ChatActions, ChatState, UserPreferences, Message, conversationHistory } from "../Utils/prompt&type";
import { handleRawUserInput } from "../master";
import { SynthesizeAPI } from "@/Context/Utils/Synthesize/apiCall";
import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
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
    conversationHistory: conversationHistory[];
    location: { latitude: number; longitude: number };
    setMessages: Dispatch<SetStateAction<Message[]>>;
    setInput: Dispatch<SetStateAction<string>>;
    setCurrentProcessingStep: Dispatch<SetStateAction<string>>;
    setConversationHistory: Dispatch<SetStateAction<conversationHistory[]>>;
    setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
}) {




    const [prevMessages, setPrevMessages] = useState(props.messages);
    const [prevInput, setPrevInput] = useState(props.input);
    const [prevUserPreferences, setPrevUserPreferences] = useState(props.userPreferences);
    const [prevCurrentProcessingStep, setPrevCurrentProcessingStep] = useState(props.currentProcessingStep);

    {/*  useEffect(() => {
        if (props.messages !== prevMessages) {
            console.log("Chat Rendered due to messages change:", props.messages);
            setPrevMessages(props.messages);
        } else if (props.input !== prevInput) {
            console.log("Chat Rendered due to input change:", props.input);
            setPrevInput(props.input);
        } else if (props.userPreferences !== prevUserPreferences) {
            console.log("Chat Rendered due to userPreferences change:", props.userPreferences);
            setPrevUserPreferences(props.userPreferences);
        } else if (props.currentProcessingStep !== prevCurrentProcessingStep) {
            console.log("Chat Rendered due to currentProcessingStep change:", props.currentProcessingStep);
            setPrevCurrentProcessingStep(props.currentProcessingStep);
        } else {
            console.log("Chat Rendered for unknown reason");
        }
    }, [props.messages, prevMessages, props.input, prevInput, props.userPreferences, prevUserPreferences, props.currentProcessingStep, prevCurrentProcessingStep]);
*/}

    const onSubmit = useCallback(async (e: React.FormEvent) => {
        console.log("On Submit Rendered");
        await handleRawUserInput(
            e,
            {
                input: props.input,
                messages: props.messages,
                userPreferences: props.userPreferences,
                currentProcessingStep: props.currentProcessingStep,
                conversationHistory: props.conversationHistory,
                location: props.location ? props.location : { latitude: 0, longitude: 0 },
            },
            {
                setMessages: props.setMessages,
                setCurrentProcessingStep: props.setCurrentProcessingStep,
                setConversationHistory: props.setConversationHistory,
                setUserPreferences: props.setUserPreferences,
            }
        );
    }, [props.input, props.messages, props.userPreferences, props.currentProcessingStep, props.conversationHistory, props.location, props.setMessages, props.setCurrentProcessingStep, props.setConversationHistory, props.setUserPreferences]);

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
                            onClick={() => {
                                props.setUserPreferences({ ...props.userPreferences, context: !props.userPreferences.context });
                            }}
                        >
                            Context
                        </button>
                    </div>
                    <div className="w-full max-w-xl">
                        <UserInput
                            input={props.input}
                            userPreferences={props.userPreferences}
                            font={sourceSerif4}
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
                            onClick={async () => {
                                const context = await SynthesizeAPI.ConversationToMarkDown(props.conversationHistory, "claude-3-5-sonnet-20241022", "Anthropic");
                                if (context) {
                                    await MarkdownAPI.WriteNewToContext(context.filename, context.markdown);
                                }
                                conversationHistoryAPI.addNewMessages(props.conversationHistory);
                            }}
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
                                    font={sourceSerif4}
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
                            onClick={() => {
                                props.setUserPreferences({ ...props.userPreferences, context: !props.userPreferences.context });
                            }}
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