import { useState } from "react";
import HeaderOptions from "./Header/HeaderOptions";
import TextArea from "./TextArea/TextArea";


export default function Text() {

    const [text, setText] = useState("");

    return <div className="flex flex-col h-screen">
        <HeaderOptions text={text} setText={setText} />
        <TextArea text={text} setText={setText} />
    </div >
}
