import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { SynthesizeAPI } from "@/Context/Utils/Synthesize/apiCall";
import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
import { handleRawTextInput } from "../master";


const TextArea = ({ text, setText, }: { text: string, setText: Dispatch<SetStateAction<string>> }) => {

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

    const saveToContext = async () => {
        const response = await SynthesizeAPI.TextToMarkDown(text, "claude-3-5-sonnet-20241022", "Anthropic");
        if (response) {
            MarkdownAPI.WriteNewToContext(response.filename, response.markdown);
        }
    }

    const extractMessage = (text: string) => {
        const regex = /\[\[(.*?)\]\]/g;
        const matches = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1]);
        }

        return matches.length > 0 ? matches[0] : text;
    }

    let contextMessage = "";

    const extractAndRemoveMessage = (text: string) => {
        const regex = /\[\[(.*?)\]\]/g;
        const matches = [];
        let match;
        let extractedMessage = "";

        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1]);
        }

        if (matches.length > 0) {
            extractedMessage = matches[0];
            // Remove the [[message]] from the text
            const cleanedText = text.replace(/\[\[.*?\]\]/, "").trim();
            setText(cleanedText);
            contextMessage = cleanedText;
            return extractedMessage;
        }

        return text;
    }

    const textstream = async () => {
        const userQuestion = extractAndRemoveMessage(text);
        const message = 'The context for this question is: ' + contextMessage + "\n\n" + 'The question is: ' + userQuestion + "your output should have a natural flow from the context and should also answer the question. Your answer will be appened to the context and that will form a new writting"
        const response = await handleRawTextInput(message);
        setText(prev => prev + "\n\n");
        if (response) {
            for await (const chunk of response.stream()) {
                setText(prev => prev + chunk);
            }
            setText(prev => prev + "\n\n");
        }
    }


    const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
        // Save to Context Button toggle (Ctrl+B)
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            textstream();
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
                saveToContext();
                setShowSaveConfirmation(false);
            }
        }
    }, [text, showSaveConfirmation]);


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

    return (<div className="overflow-y-auto">
        <div className="flex justify-center">
            <div className=" flex w-full max-w-3xl">
                <textarea
                    className="w-full p-2 resize-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none bg-transparent h-screen transition-all duration-200 text-gray-800 outline-none border-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start writing..."
                    disabled={showSaveConfirmation}
                    style={{
                        border: 'none',
                        boxShadow: 'none',
                        fontFamily: 'inherit'
                    }}
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