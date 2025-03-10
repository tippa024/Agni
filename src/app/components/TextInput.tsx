import { useState, useEffect, useCallback, useRef } from "react";
import MarkdownRenderer from "../lib/utils/render";
import ReadContextFiles from "./ReadContextFiles";

export default function TextInput() {
    const [text, setText] = useState("");
    const [showSaveToContextButton, setShowSaveToContextButton] = useState(false);
    const [showMarkdown, setShowMarkdown] = useState(false);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);


    const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
        // Save to Context Button toggle (Ctrl+B)
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            setShowSaveToContextButton(prev => !prev);
        }

        // Toggle Markdown view (Ctrl+J)
        if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
            e.preventDefault();
            setShowMarkdown(prev => !prev);
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

    const saveToContext = async () => {
        try {
            const response = await fetch('/api/History/MarkDown/Save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: text }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`File saved as ${result.filename} at ${result.path}`);
                alert(`File saved as ${result.filename} at ${result.path}`);
            } else {
                const error = await response.text();
                alert(`Error saving file: ${error}`);
            }
        } catch (error) {
            console.error('Error saving markdown file:', error);
            alert('Failed to save file. Check console for details.');
        }
    };

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


    return <div className="w-full flex flex-col">
        <div className="flex flex-row w-full">
            <div className="basis-1/6">
                <div className="flex justify-end px-4 py-2">
                    {showSaveToContextButton && text.length > 0 && <button
                        className="px-2 py-1 text-gray-700 rounded-md opacity-10 hover:opacity-100 hover:bg-gray-200 transition-opacity text-sm font-medium"
                        onClick={saveToContext}
                    >
                        Save to Context
                    </button>
                    }
                </div>
            </div>
            <div className="basis-2/3">
                <textarea
                    className="w-full p-2 resize-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none bg-transparent min-h-[300px] transition-all duration-200 text-gray-800 outline-none border-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start writing..."
                    disabled={showSaveConfirmation}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = '300px';
                        if (target.value.trim() !== "") {
                            target.style.height = `${Math.max(300, target.scrollHeight)}px`;
                        } else {
                            target.style.height = '300px';
                        }
                    }}
                    style={{
                        border: 'none',
                        boxShadow: 'none',
                        fontFamily: 'inherit'
                    }}
                />
            </div>
            <div className='flex justify-end basis-1/6'>
                <button className={`bg-[#4A4235] opacity-20 hover:opacity-80 text-white px-3 py-1.5 transition-colors duration-200 font-medium text-sm`}
                >
                    Context
                </button>
            </div>
        </div>
        {
            showMarkdown && (
                <div className='prose prose-sm w-2/3 mx-auto mt-6'>
                    <MarkdownRenderer content={text} />
                </div>
            )
        }

        <div className="basis-1/6">
            <ReadContextFiles />
        </div>
        {/* Save Confirmation Dialog */}
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
                            onClick={() => {
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
}
