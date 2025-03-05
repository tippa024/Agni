import { useState, useEffect, useCallback } from "react";
import MarkdownRenderer from "../lib/utils/render";
import ReadContextFiles from "./ReadContextFiles";

export default function TextInput() {
    const [text, setText] = useState("");
    const [showSaveToContextButton, setShowSaveToContextButton] = useState(false);

    const SaveToContextButton = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.code === 'Enter') {
            e.preventDefault();
            setShowSaveToContextButton(prev => !prev);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', SaveToContextButton);
        return () => {
            window.removeEventListener('keydown', SaveToContextButton);
        };
    }, [SaveToContextButton]);

    return <div className="w-full flex flex-col">
        <div className="flex flex-row w-full">
            <div className="basis-1/6">
                <div className="flex justify-end px-4 py-2">
                    {showSaveToContextButton && text.length > 0 && <button
                        className="px-2 py-1 text-gray-700 rounded-md opacity-10 hover:opacity-100 hover:bg-gray-200 transition-colors transition-opacity text-sm font-medium"
                        onClick={async () => {
                            try {
                                const response = await fetch('/api/MarkDown/Save', {
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
                        }}
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
            <div className="basis-1/6">
                <ReadContextFiles />
            </div>
        </div>
        <div className='prose prose-sm w-2/3 mx-auto mt-6'>
            <MarkdownRenderer content={text} />
        </div>
    </div>;
}