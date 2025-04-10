import { SearchResult } from "@/Mediums/Chat/Utils/prompt&type";
import { useState } from "react";
import { memo } from "react";
const SearchResultsinChat = function SearchResultsinChat({ sources }: { sources: SearchResult[] }) {

    const [showAllSources, setShowAllSources] = useState(false);
    if (sources && sources.length > 0) {
        return (
            <div className="flex justify-start mb-8">
                <div className="w-full max-w-3xl bg-[#F5F5F5] border border-[#2C2C2C] px-4 py-3">
                    <div className="flex items-center justify-between mb-3 border-b border-[#2C2C2C] pb-2">
                        <span className="text-sm font-mono text-[#2C2C2C] uppercase">
                            Sources [{sources?.length}]
                        </span>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {(showAllSources ? sources : sources.slice(0, 3)).map((result: SearchResult, index: number) => (
                            <div key={index} className="border-b border-[#2C2C2C]/20 pb-3 last:border-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-mono text-sm text-[#2C2C2C]">{index + 1}.</span>
                                    <a
                                        href={result.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-[#2C2C2C] hover:underline font-mono"
                                    >
                                        {result.title}
                                    </a>
                                </div>
                                <p className="text-sm text-[#2C2C2C]/80 pl-4 font-mono">
                                    {result.snippet}
                                </p>
                            </div>
                        ))}
                    </div>

                    {sources.length > 3 && (
                        <button
                            onClick={() => setShowAllSources(!showAllSources)}
                            className="mt-3 text-xs font-mono text-[#2C2C2C]/70 hover:text-[#2C2C2C]"
                        >
                            {showAllSources ? '[ - SHOW LESS - ]' : `[ + SHOW ${sources.length - 3} MORE ]`}
                        </button>
                    )}
                </div>
            </div>
        )
    }
    if (sources && sources.length === 0) {
        return (
            <div className="flex justify-start mb-8">
                <div className="w-full max-w-3xl bg-[#F5F5F5] border border-[#2C2C2C] px-4 py-3">
                    <div className="flex items-center justify-between mb-3 border-b border-[#2C2C2C] pb-2">
                        <span className="text-sm font-mono text-[#2C2C2C] uppercase">Search Results</span>
                    </div>
                    <div className="text-sm font-mono text-[#2C2C2C]/70 py-2">
                        No relevant search results found.
                    </div>
                </div>
            </div>
        )
    }
}

export default memo(SearchResultsinChat);
