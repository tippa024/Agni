
import { Dispatch, SetStateAction, useState } from "react";
import { ContextDropdown, SaveToContextButton } from "./Children";

const HeaderOptions = ({ text, setText }: { text: string, setText: Dispatch<SetStateAction<string>> }) => {

    const [showSaveToContextButton, setShowSaveToContextButton] = useState(false);

    return (
        <div className="flex justify-between">
            <SaveToContextButton text={text} showSaveToContextButton={showSaveToContextButton} />
            <ContextDropdown setText={setText} showSaveToContextButton={showSaveToContextButton} />
        </div>
    )
}


export default HeaderOptions;       