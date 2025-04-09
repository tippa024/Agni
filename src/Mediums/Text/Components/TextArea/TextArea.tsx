import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { SynthesizeAPI } from "@/Context/Utils/Synthesize/apiCall";
import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
import { handleRawTextInput } from "../../master";
import { conversationHistory } from "@/Mediums/Chat/Utils/prompt&type";


const TextArea = ({ text, setText, TextConversationHistory, setTextConversationHistory }: { text: string, setText: Dispatch<SetStateAction<string>>, TextConversationHistory: conversationHistory[], setTextConversationHistory: Dispatch<SetStateAction<conversationHistory[]>> }) => {

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

    const saveToContext = async () => {
        const response = await SynthesizeAPI.TextToMarkDown(text, "claude-3-5-sonnet-20241022", "Anthropic");
        if (response) {
            MarkdownAPI.WriteNewToContext(response.filename, response.markdown);
        }
    }

    const handleKeyboardShortcuts = useCallback(async (e: KeyboardEvent) => {
        //(Ctrl+B)
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            await handleRawTextInput(text, setText, TextConversationHistory, setTextConversationHistory);
        }

        // Open save confirmation (Ctrl+Enter)
        if ((e.metaKey || e.ctrlKey) && e.code === 'Enter') {
            e.preventDefault();
            if (text.length > 0) {
                setShowSaveConfirmation(true);
            }
        }

        // Handle dialog keyboard navigation
        if (showSaveConfirmation) {
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowSaveConfirmation(false);
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                await MarkdownAPI.WriteNewToContext(text);
                setShowSaveConfirmation(false);
            }
        }
    }, [text, showSaveConfirmation, setText]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyboardShortcuts);

        return () => {
            window.removeEventListener('keydown', handleKeyboardShortcuts);
        };
    }, [handleKeyboardShortcuts]);

    useEffect(() => {
        if (textAreaRef.current && !showSaveConfirmation) {
            textAreaRef.current.focus();
        }
    }, [showSaveConfirmation]);

    const [showBackUpBackground, setShowBackUpBackground] = useState(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        // Check if the last character typed is '@'
        setShowBackUpBackground(e.target.value.endsWith('@'));
    };

    return (<div className="overflow-y-auto">
        <div className="flex justify-center">
            <div className=" flex w-full max-w-3xl">
                <textarea
                    className={`w-full p-2 resize-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none bg-transparent h-screen transition-all duration-200 text-gray-800 outline-none border-none ${showBackUpBackground ? 'bg-gray-500' : 'bg-white'}`}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        handleTextChange(e);
                    }}
                    placeholder="Start writing..."
                    disabled={showSaveConfirmation}
                    ref={textAreaRef}
                />
            </div>
        </div>

        {showSaveConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                    <h3 className="text-lg font-medium mb-4">Save Document</h3>
                    <p className="mb-6">Do you want to save this document to context?</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            onClick={() => setShowSaveConfirmation(false)}
                        >
                            Cancel (Esc)
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-800 text-white hover:border-gray-800 border hover:bg-white hover:text-gray-800 rounded-md"
                            onClick={async () => {
                                saveToContext();
                                setShowSaveConfirmation(false);
                            }}
                        >
                            Save (Enter)
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    )
}

export default TextArea;