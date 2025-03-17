import { useState, useEffect, useCallback, useRef } from "react";
import MarkdownRenderer from "../render";
import { MarkdownAPI } from "../../lib/utils/Context/Markdown/apiCall";



export default function TextInput() {
    const [text, setText] = useState("");
    const [showSaveToContextButton, setShowSaveToContextButton] = useState(false);
    const [showMarkdown, setShowMarkdown] = useState(false);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [contextFiles, setContextFiles] = useState<string[]>([]);
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

    const saveToContext = async () => {
        try {
            const filename = `Context_${new Date()
                .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                .replace(/[/:\s]/g, "-")}.md`;

            const result = await MarkdownAPI.WriteNewToContext(filename, text);

            if (result && result.success) {
                console.log(`File saved as ${result.filename} at ${result.path}`);
                alert(`File saved as ${result.filename} at ${result.path}`);
            } else {
                alert(`Error saving file: ${result?.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving markdown file:', error);
            alert(`Failed to save file. ${error}. Please check the console for more details.`);
        }
    };

    useEffect(() => {
        const fetchContextFiles = async () => {
            const response = await MarkdownAPI.ReadAllContextFileNamesOnly();
            setContextFiles(response.files);
        };
        fetchContextFiles();
    }, []);


    return <div className="flex flex-col h-screen">
        <div className="flex justify-between">
            <div className="flex justify-start">
                <button
                    className={`bg-[#4A4235] text-white px-3 py-1.5 hover:opacity-80 transition-colors duration-200 font-medium text-sm
                    ${showSaveToContextButton ? 'opacity-20' : 'opacity-0'}`}
                    onClick={saveToContext}
                >
                    Save to Context
                </button>
            </div>
            <div className='flex justify-end'>
                <div className="relative">
                    <button
                        className={`bg-[#4A4235] text-white px-3 py-1.5 hover:opacity-80 transition-colors duration-200 font-medium text-sm
                        ${showSaveToContextButton ? 'opacity-20' : 'opacity-0'}
                        ${showContextDropdown ? 'opacity-80' : ''}`}
                        onClick={() => setShowContextDropdown(prev => !prev)}
                    >
                        Context
                    </button>
                    {showContextDropdown && (
                        <div className="absolute right-0 mt-1 w-64 bg-white shadow-lg rounded-md z-10 max-h-60 overflow-y-auto">
                            {contextFiles.length > 0 ? (
                                <ul className="py-1">
                                    {contextFiles.map((file, index) => (
                                        <li
                                            key={index}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                            onClick={async () => {
                                                const response = await MarkdownAPI.ReadAParticularContextFile(file);
                                                setText(response.content);
                                            }}
                                        >
                                            {file}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="px-4 py-2 text-sm text-gray-500">No context files found</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex justify-center">
            <div className=" flex w-full max-w-3xl">
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
        </div>
        {
            showMarkdown && (
                <div className='prose prose-sm w-2/3 mx-auto mt-6'>
                    <MarkdownRenderer content={text} />
                </div>
            )
        }
        {
            showSaveConfirmation && (
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
            )
        }
    </div >
}
