import { useRef, useEffect, useState } from "react";
import UserInput from "./ChatInput/ChatInput";
import { UserPreferences, Message, conversationHistory, ChatActions, ChatState } from "../Utils/prompt&type";
import { handleRawUserInput } from "../master";
import { SynthesizeAPI } from "@/Context/Utils/Synthesize/apiCall";
import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
import { conversationHistoryAPI } from "@/Context/Utils/ConversationHistory/apiCall";
import { MessageBubble } from "./MessageBubble/MessageBubble";
import { Source_Serif_4 } from "next/font/google";

const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

interface ChatProps {
    chatState: ChatState;
    chatActions: ChatActions;
}

export default function Chat({ chatState, chatActions }: ChatProps) {

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentProcessingStep, setCurrentProcessingStep] = useState<string>('');

    const [userPreferences, setUserPreferences] = useState<UserPreferences>({
        searchEnabled: false,
        context: true,
        model: ["gpt-4o-mini", "OpenAI"] as ["gpt-4o-mini", "OpenAI"] | ["claude-3-5-haiku-20241022", "Anthropic"] | ["claude-3-5-sonnet-20241022", "Anthropic"],
    });

    const [conversationHistory, setConversationHistory] = useState<conversationHistory[]>([]);


    const onSubmit = async (e: React.FormEvent) => {
        await handleRawUserInput(
            e,
            {
                input: chatState.input,
                messages: chatState.messages,
                userPreferences: chatState.userPreferences,
                currentProcessingStep: chatState.currentProcessingStep,
                conversationHistory: chatState.conversationHistory,
                location: chatState.location ? chatState.location : { latitude: 0, longitude: 0 },
            },
            {
                setMessages: chatActions.setMessages,
                setInput: chatActions.setInput,
                setCurrentProcessingStep: chatActions.setCurrentProcessingStep,
                setConversationHistory: chatActions.setConversationHistory,
                setUserPreferences: chatActions.setUserPreferences,
            }
        );
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        // Only scroll to bottom if user is already at the bottom or a new message is added
        const scrollContainer = messagesEndRef.current?.parentElement;
        if (scrollContainer) {
            const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;

            // Check if a new message was added (not just content updated)
            const isNewMessage = chatState.messages.length > 0 &&
                chatState.messages[chatState.messages.length - 1].content.trim() !== '';

            if (isAtBottom || isNewMessage) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [chatState.messages]);


    return (

        (
            chatState.messages?.length === 0 ? (
                <div className="w-full h-screen  flex flex-col items-center justify-center">
                    <div className='flex justify-center mb-4'>
                        <button
                            className={`bg-[#4A4235] text-white px-3 py-1.5 rounded-md transition-colors duration-200 font-medium text-sm
                            ${userPreferences.context ? 'opacity-80' : 'opacity-20'} hover:opacity-100`}
                            onClick={() => {
                                setUserPreferences({ ...userPreferences, context: !userPreferences.context });
                            }}
                        >
                            Context
                        </button>
                    </div>
                    <div className="w-full">
                        <UserInput
                            input={chatState.input}
                            userPreferences={chatState.userPreferences}
                            font={sourceSerif4}
                            handleSubmit={onSubmit}
                            setInput={chatActions.setInput}
                            setUserPreferences={chatActions.setUserPreferences}
                        />
                    </div>
                </div>
            ) : (
                (<div className="flex flex-col h-screen">
                    <div className='flex justify-between'>
                        <div className='flex justify-start'>
                            <button className='bg-[#4A4235] text-white px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 font-medium text-sm'
                                onClick={async () => {
                                    const context = await SynthesizeAPI.ConversationToMarkDown(conversationHistory, "claude-3-5-sonnet-20241022", "Anthropic");
                                    if (context) {
                                        await MarkdownAPI.WriteNewToContext(context.filename, context.markdown);
                                    }
                                    conversationHistoryAPI.addNewMessages(conversationHistory);
                                }}
                            >
                                Save
                            </button>
                        </div>
                        <div className='flex justify-end'>
                            <button className={`bg-[#4A4235] text-white px-3 py-1.5 transition-colors duration-200 font-medium text-sm
                 ${userPreferences.context ? 'opacity-80' : 'opacity-20'}`}
                                onClick={() => {
                                    setUserPreferences({ ...userPreferences, context: !userPreferences.context });
                                }}
                            >
                                Context
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-3xl mx-auto px-4 overflow-hidden overflow-wrap-break-word">
                        <div className="h-full py-4  overflow-y-auto scrollbar-hide">
                            <div className="space-y-4 pb-2 rounded-lg">
                                {chatState.messages.map((message, index) => (
                                    <div key={index}>
                                        <MessageBubble
                                            messageComponentIndex={index}
                                            message={message}
                                            currentProcessingStep={
                                                message.role === 'assistant' &&
                                                    index === chatState.messages.length - 1 ?
                                                    chatState.currentProcessingStep :
                                                    ''
                                            }
                                            userPreferences={chatState.userPreferences}
                                        />
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>
                    <div className="sticky bottom-0 left-0 right-0 bg-white p-4 sm:pb-6 border-t border-gray-200">
                        <div className="max-w-3xl mx-auto">
                            <UserInput
                                input={chatState.input}
                                userPreferences={chatState.userPreferences}
                                font={sourceSerif4}
                                handleSubmit={onSubmit}
                                setInput={chatActions.setInput}
                                setUserPreferences={setUserPreferences}
                            />
                        </div>
                    </div>
                </div>)
            )

        )
    )
}   