import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ChatInputProps } from "@/Mediums/Chat/Utils/prompt&type";
import UserPreferenceToggle from "./Children/UserPreferenceToggle";
import InputTextArea from "./Children/InputTextArea";
import SendButton from "./Children/SendButton";


const UserInput = memo(function UserInput({
    input,
    userPreferences,
    font,
    onSubmit,
    setInput,
    setUserPreferences,
}: ChatInputProps) {


    const [showSendButton, setShowSendButton] = useState(false);

    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault(); //still not sure if this is needed, but it's here to be safe
        if (!input.trim()) return;
        console.log('Chat Input Received:', { userQuery: input.trim(), userPreferences });
        onSubmit(e);
        setInput('');
    }, [setInput, input, onSubmit, userPreferences]);

    const handleInputNull = useCallback((isInputNull: boolean) => {
        setShowSendButton(!isInputNull);
    }, []);

    return (
        <form
            onSubmit={handleFormSubmit}
        >
            <div className={`relative flex items-center gap-3 rounded-xl border ${userPreferences.context ? 'border-gray-300 focus-within:border-gray-500' : 'border-gray-100 focus-within:border-gray-200 '} shadow-sm hover:shadow-md focus-within:shadow-lg transition-all duration-300 w-full group`}>
                <UserPreferenceToggle
                    userPreferences={userPreferences}
                    setUserPreferences={setUserPreferences}
                />
                <InputTextArea
                    input={input}
                    setInput={setInput}
                    handleFormSubmit={handleFormSubmit}
                    font={font}
                    inputNull={handleInputNull}
                />
                <SendButton showSendButton={showSendButton} />
            </div>
        </form>
    )
});

export default UserInput;