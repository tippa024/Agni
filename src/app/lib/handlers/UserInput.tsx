import { Switch } from "../../components/ui/Switch";
import { Label } from "../../components/ui/Label";
import { memo, useEffect, useRef } from "react";
import { ChatInputProps } from "../utils/type";


export const UserInput = memo(function UserInput({
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

        // Add console logs
        console.log('Chat Input Config:', {
            userQuery: input.trim(),
            searchEnabled: userPreferences.searchEnabled,
            model: userPreferences.model[0],
        });
        handleSubmit(e);
    };

    return (
        <form
            onSubmit={handleFormSubmit}
            className="max-w-xl mx-auto"
        >
            <div className="relative flex items-center gap-3 bg-white rounded-xl border border-[#4A4235]/15 shadow-sm hover:shadow-md transition-all duration-300 w-full group focus-within:border-[#4A4235]/30 focus-within:shadow-lg">
                {/* Control Toggles */}
                <div className="flex items-center gap-1.5 p-3">
                    <div className="flex flex-col gap-2  w-[140px] border-r border-[#4A4235]/10 my-2">
                        <div className="flex items-start gap-2">
                            <Switch
                                checked={userPreferences.searchEnabled}
                                onCheckedChange={(checked: boolean | ((prevState: boolean) => boolean)) => setUserPreferences(prev => ({ ...prev, searchEnabled: checked as boolean }))}
                                className="data-[state=checked]:bg-[#4A4235]"
                            />
                            <div className="flex items-center gap-2">
                                <Label className={`text-sm transition-opacity duration-200 ${userPreferences.searchEnabled ? 'text-[#4A4235] font-medium opacity-100' : 'text-[#4A4235] opacity-50'}`}>
                                    Search
                                </Label>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={userPreferences.model[0]}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "gpt-4o-mini") {
                                        setUserPreferences(prev => ({ ...prev, model: ["gpt-4o-mini", "OpenAI"] }));
                                    } else if (value === "gpt-4o") {
                                        setUserPreferences(prev => ({ ...prev, model: ["gpt-4o", "OpenAI"] }));
                                    } else if (value === "claude-3-5-haiku") {
                                        setUserPreferences(prev => ({ ...prev, model: ["claude-3-5-haiku", "Anthropic"] }));
                                    } else if (value === "claude-3-5-sonnet") {
                                        setUserPreferences(prev => ({ ...prev, model: ["claude-3-5-sonnet", "Anthropic"] }));
                                    }
                                }}
                                className="appearance-none text-sm bg-transparent border border-[#4A4235]/5 rounded-lg px-3 py-1.5 
                                         focus:outline-none focus:border-[#4A4235]/40 focus:ring-1 focus:ring-[#4A4235]/20
                                         cursor-pointer transition-all duration-100 hover:border-[#4A4235]/30
                                         text-[#4A4235] font-medium min-w-[100px]"
                            >
                                <option value="claude-3-5-haiku">Haiku 3.5</option>
                                <option value="gpt-4o-mini">4o Mini</option>
                                <option value="gpt-4o">4o</option>
                                <option value="claude-3-5-sonnet">Sonnet 3.5</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                            e.preventDefault();
                            handleFormSubmit(e);
                        }
                    }}
                    placeholder="What's on your mind?"
                    className={`flex-1 min-h-[48px] max-h-[120px] max-w-[600px] py-2 px-3 text-[#2C2C2C] ${font.className}
                        bg-white border-none focus:outline-none resize-none text-base
                        leading-relaxed font-mono placeholder:text-[#2C2C2C]/30 overflow-y-auto scrollbar-hide`}
                    style={{
                        height: '48px',
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = '48px'
                        target.style.height = `${Math.min(target.scrollHeight, 200)}px`
                    }}
                />

                {/* Send Button */}
                <div className="transition-all duration-300 ease-out opacity-0 scale-90 origin-center"
                    style={{
                        opacity: input.trim() ? 1 : 0,
                        transform: input.trim() ? 'scale(1)' : 'scale(0.9)',
                        transitionDuration: input.trim() ? '300ms' : '150ms'
                    }}>
                    <button
                        type="submit"
                        className="mr-3 p-2.5 rounded-xl transition-all text-white bg-[#4A4235] hover:bg-[#4A4235]/90 active:scale-95 shadow-sm"
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </form>
    )
});