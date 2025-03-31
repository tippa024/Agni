
export const InputTextArea = function InputTextArea({
    input,
    setInput,
    handleFormSubmit,
    font,
}: {
    input: string;
    setInput: (input: string) => void;
    handleFormSubmit: (e: React.FormEvent) => void;
    font: { className: string };
}) {

    return (
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                    e.preventDefault();
                    handleFormSubmit(e);
                    e.currentTarget.style.height = '48px';
                }
            }}
            placeholder="What's on your mind?"
            className={`flex-1 min-h-[48px] max-h-[120px] border-2 border-[#4A4235]/15 rounded-lg max-w-[600px] py-2 px-3 text-[#2C2C2C] ${font.className}
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
    )
}