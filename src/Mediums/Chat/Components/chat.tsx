import { useRef, useEffect, useState } from "react";
import UserInput from "./ChatInput/ChatInput";
import { ChatActions, ChatState } from "../Utils/prompt&type";
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
        const scrollContainer = messagesEndRef.current?.parentElement;
        if (scrollContainer) {
            const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;

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
                            className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 hover:scale-105
                            ${chatState.userPreferences.context
                                    ? 'bg-gray-200 text-black opacity-80 hover:opacity-100'
                                    : 'bg-gray-300 text-white opacity-50 hover:opacity-80'}`}
                            onClick={() => {
                                chatActions.setUserPreferences({ ...chatState.userPreferences, context: !chatState.userPreferences.context });
                            }}
                        >
                            Context
                        </button>
                    </div>
                    <div className="w-full max-w-xl">
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
                (<div className="flex flex-row h-screen">
                    <div className='flex h-8'>
                        <button className='bg-[#4A4235] text-white px-3 py-1.5 opacity-20 hover:opacity-80 transition-colors duration-200 font-medium text-sm'
                            onClick={async () => {
                                const context = await SynthesizeAPI.ConversationToMarkDown(chatState.conversationHistory, "claude-3-5-sonnet-20241022", "Anthropic");
                                if (context) {
                                    await MarkdownAPI.WriteNewToContext(context.filename, context.markdown);
                                }
                                conversationHistoryAPI.addNewMessages(chatState.conversationHistory);
                            }}
                        >
                            Save
                        </button>
                    </div>
                    <div className="flex-1 w-full max-w-3xl mx-auto px-4 overflow-hidden overflow-wrap-break-word flex flex-col">
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto scrollbar-hide">
                                <div className="space-y-4 pb-2 rounded-lg ">
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
                                    input={chatState.input}
                                    userPreferences={chatState.userPreferences}
                                    font={sourceSerif4}
                                    handleSubmit={onSubmit}
                                    setInput={chatActions.setInput}
                                    setUserPreferences={chatActions.setUserPreferences}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='flex h-8'>
                        <button className={`bg-[#4A4235] text-white px-3 py-1.5 transition-colors duration-200 font-medium text-sm
                 ${chatState.userPreferences.context ? 'opacity-80' : 'opacity-20'}`}
                            onClick={() => {
                                chatActions.setUserPreferences({ ...chatState.userPreferences, context: !chatState.userPreferences.context });
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