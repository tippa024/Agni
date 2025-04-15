import { useState } from "react";
import HeaderOptions from "./Header/HeaderOptions";
import TextArea from "./TextArea/TextArea";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";



console.log("Text Rendered");

export default function Text() {


    const [text, setText] = useState("");

    const [textConversation, setTextConversation] = useState<
        Message[]
    >([]);


    return <div className="flex flex-col h-screen">
        <HeaderOptions text={text} setText={setText} />
        <TextArea text={text} setText={setText} TextConversation={textConversation} setTextConversation={setTextConversation} />
    </div >
}
