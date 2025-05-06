import { useState, Dispatch, SetStateAction } from "react";
import HeaderOptions from "./Header/HeaderOptions";
import TextArea from "./TextArea/TextArea";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";


export default function Text(props: { text: string; setText: Dispatch<SetStateAction<string>> }) {

    const [textConversation, setTextConversation] = useState<
        Message[]
    >([]);


    return <div className="flex flex-col h-screen">
        <HeaderOptions text={props.text} setText={props.setText} />
        <TextArea text={props.text} setText={props.setText} TextConversation={textConversation} setTextConversation={setTextConversation} />
    </div >
}
