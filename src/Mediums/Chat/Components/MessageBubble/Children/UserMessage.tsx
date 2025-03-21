import { Message } from "@/Mediums/Chat/Utils/prompt&type";

const UserMessageinChat = function UserMessageinChat({ message, font }: { message: Message, font: { className: string } }) {
    return (
        <div className="flex justify-end p-2 border-red-500">
            <div className="max-w-2xl break-words font-stretch-expanded px-4 py-2">
                <div className={`${font.className} text-[#4A4235] text-base`}>{message.content}</div>
            </div>
        </div>
    )
}
export default UserMessageinChat;