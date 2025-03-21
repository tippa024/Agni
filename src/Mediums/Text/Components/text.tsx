import { Dispatch, SetStateAction, useState } from "react";
import HeaderOptions from "./HeaderOptions";
import TextArea from "./TextArea";


export default function Text({ text, setText }: { text: string, setText: Dispatch<SetStateAction<string>> }) {


    return <div className="flex flex-col h-screen">
        <HeaderOptions text={text} setText={setText} />
        <TextArea text={text} setText={setText} />
    </div >
}
