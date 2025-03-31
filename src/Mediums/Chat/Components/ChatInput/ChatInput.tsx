import { ChatInputProps } from "@/Mediums/Chat/Utils/prompt&type";
import { UserPreferenceToggle } from "./Children/UserPreferenceToggle";
import { InputTextArea } from "./Children/InputTextArea";
import { SendButton } from "./Children/SendButton";


const UserInput = function UserInput({
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
        console.log('Chat Input Received:', { userQuery: input.trim(), userPreferences });
        handleSubmit(e);
    };

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
                />
                <SendButton input={input} />
            </div>
        </form>
    )
};

export default UserInput;