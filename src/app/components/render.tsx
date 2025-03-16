import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <ReactMarkdown children={content} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeRaw]} />
    );
}