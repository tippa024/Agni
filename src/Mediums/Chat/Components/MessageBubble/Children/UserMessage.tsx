import { Message } from "@/Mediums/Chat/Utils/prompt&type";
import { useEffect } from "react";
import { useState } from "react";

const UserMessageinChat = function UserMessageinChat({ message, font }: { message: Message, font: { className: string } }) {
    const [prevMessage, setPrevMessage] = useState(message);

    useEffect(() => {
        if (message !== prevMessage) {
            setPrevMessage(message);
        } else {
            console.log("User Message in Chat Rendered for unknown reason", Date.now());
        }
    }, [message, prevMessage]);

    return (
        <div className="flex flex-col items-end p-2">
            <div className="max-w-2xl break-words font-stretch-expanded px-4 py-2 bg-[#f6f6f6] rounded-2xl">
                <div className={`${font.className} text-[#4A4235] text-base`}>{message.content}</div>
            </div>
        </div>
    )
}
export default UserMessageinChat;