import { MarkdownAPI } from "@/Context/Utils/Markdown/apiCall";
import { SynthesizeAPI } from "@/Context/Utils/Synthesize/apiCall";
import { handleRawTextInput } from "@/Mediums/Text/master";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ContextDropdown, SaveToContextButton } from "./Children";

const HeaderOptions = ({ text, setText }: { text: string, setText: Dispatch<SetStateAction<string>> }) => {

    const [showSaveToContextButton, setShowSaveToContextButton] = useState(false);

    const textstream = async () => {
        const response = await handleRawTextInput(text, setText);
        setText(prev => prev + "\n\n$");
        if (response) {
            for await (const chunk of response.stream()) {
                setText(prev => prev + chunk);
            }
            setText(prev => prev + "\n\n");
        }
    }

    return (
        <div className="flex justify-between">
            <SaveToContextButton text={text} showSaveToContextButton={showSaveToContextButton} />
            <ContextDropdown setText={setText} showSaveToContextButton={showSaveToContextButton} />
        </div>
    )
}


export default HeaderOptions;       