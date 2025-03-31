import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
import { SynthesizeAPI } from "@/Context/Utils/Synthesize/apiCall";
import { Dispatch, SetStateAction, useEffect, useState } from "react";


export const SaveToContextButton = ({ text, showSaveToContextButton }: {
    text: string;
    showSaveToContextButton: boolean;
}) => {
    return (
        <div className="flex justify-start">
            <button
                className={`bg-[#4A4235] text-white px-3 py-1.5 hover:opacity-80 transition-colors duration-200 font-medium text-sm
${showSaveToContextButton ? 'opacity-20' : 'opacity-0'}`}
                onClick={async () => {
                    const response = await SynthesizeAPI.TextToMarkDown(text, "claude-3-5-sonnet-20241022", "Anthropic");
                    if (response) {
                        MarkdownAPI.WriteNewToContext(response.filename, response.markdown);
                    }
                }}
            >
                Save to Context
            </button>
        </div>
    )
}

export const ContextDropdown = ({
    setText,
    showSaveToContextButton

}: {
    setText: Dispatch<SetStateAction<string>>;
    showSaveToContextButton: boolean;
}) => {

    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [contextFiles, setContextFiles] = useState<string[]>([]);

    useEffect(() => {
        const fetchContextFiles = async () => {
            const response = await MarkdownAPI.ReadAllContextFileNamesOnly();
            setContextFiles(response.files);
        };
        fetchContextFiles();
    }, []);

    return (
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
    )
}