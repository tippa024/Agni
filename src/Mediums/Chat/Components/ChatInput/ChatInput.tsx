import { memo } from "react";
import { ChatInputProps } from "@/Mediums/Chat/Utils/prompt&type";
import { UserPreferenceToggle } from "./Children/UserPreferenceToggle";
import { InputTextArea } from "./Children/InputTextArea";
import { SendButton } from "./Children/SendButton";


const UserInput = memo(function UserInput({
    input,
    userPreferences,
    font,
    handleSubmit,
    setInput,
    setUserPreferences,
}: ChatInputProps) {


    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault(); //still not sure if this is needed, but it's here to be safe
        if (!input.trim()) return;

        console.log('Chat Input Received:', { userQuery: input.trim(), searchEnabled: userPreferences.searchEnabled, model: userPreferences.model[0], });
        handleSubmit(e);
    };

    return (
        <form
            onSubmit={handleFormSubmit}
            className="max-w-xl mx-auto"
        >
            <div className="relative flex items-center gap-3 bg-white rounded-xl border border-[#4A4235]/15 shadow-sm hover:shadow-md transition-all duration-300 w-full group focus-within:border-[#4A4235]/30 focus-within:shadow-lg">
                {/* Control Toggles */}
                <UserPreferenceToggle
                    userPreferences={userPreferences}
                    setUserPreferences={setUserPreferences}
                />
                <InputTextArea
                    input={input}
                    setInput={setInput}
                    handleFormSubmit={handleFormSubmit}
                    font={font}
                />
                <SendButton input={input} />
            </div>
        </form>
    )
});

export default UserInput;