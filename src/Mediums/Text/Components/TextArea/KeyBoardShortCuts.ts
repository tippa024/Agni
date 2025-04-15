import { Dispatch, SetStateAction } from "react";
import { handleRawTextInput } from "../../master";
import { Message } from "@/Mediums/Chat/Utils/prompt&type";
export const handleKeyboardShortcuts = async (
  e: KeyboardEvent,
  text: string,
  setText: Dispatch<SetStateAction<string>>,
  setShowSaveConfirmation: Dispatch<SetStateAction<boolean>>,
  showSaveConfirmation: boolean,
  saveToContext: () => void,
  textConversation: Message[],
  setTextConversation: Dispatch<SetStateAction<Message[]>>
) => {
  //(Ctrl+B)
  if ((e.metaKey || e.ctrlKey) && e.key === "b") {
    e.preventDefault();
    await handleRawTextInput(
      text,
      setText,
      textConversation,
      setTextConversation
    );
  }

  // Open save confirmation (Ctrl+Enter)
  if ((e.metaKey || e.ctrlKey) && e.code === "Enter") {
    e.preventDefault();
    if (text.length > 0) {
      setShowSaveConfirmation(true);
    }
  }

  // Handle dialog keyboard navigation
  if (showSaveConfirmation) {
    if (e.key === "Escape") {
      e.preventDefault();
      setShowSaveConfirmation(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      saveToContext();
      setShowSaveConfirmation(false);
    }
  }
};
