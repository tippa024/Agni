import { conversationHistory } from "../type";

// Read APIs/////////////////////////////////////////////////////////

export const ReadAllContextFileNamesOnly = async () => {
  console.log("Reading all context file names via ReadAllContextFileNames API");
  try {
    const response = await fetch(
      "/api/History/MarkDown/Read?includeContent=false"
    );
    const data = await response.json();
    console.log("ReadAllContextFileNames API Response", data);
    // example of data is
    // {
    //     "files": [
    //         "file1.md",
    //         "file2.md"
    //     ]
    // }
    return data;
  } catch (error) {
    console.error("Error reading all context file names:", error);
    return null;
  }
};

export const ReadAllContextFilesNamesAndContent = async () => {
  console.log("Reading all context files via ReadAllContextFiles API");
  try {
    const response = await fetch(
      "/api/History/MarkDown/Read?includeContent=true"
    );
    const data = await response.json();
    console.log("ReadAllContextFiles API Response", data);
    // example of data is
    // {
    //     "files": [
    //         {
    //             "filename": "file1.md",
    //             "content": "This is the content of file1.md"
    //         }
    //     ]
    // }
    return data;
  } catch (error) {
    console.error("Error reading all context files:", error);
    return null;
  }
};

export const ReadAParticularContextFile = async (filename: string) => {
  console.log(
    `Reading ${filename} context file via ReadAParticularContextFile API`
  );
  try {
    const response = await fetch(
      `/api/History/MarkDown/Read?filename=${filename}`
    );
    const data = await response.json();
    console.log("ReadAParticularContextFile API Response", data);
    // example of data is
    // {
    //     "filename": "file1.md",
    //     "content": "This is the content of file1.md"
    // }
    return data;
  } catch (error) {
    console.error("Error reading particular context file:", error);
    return null;
  }
};

// Write APIs/////////////////////////////////////////////////////////

export const WriteToContext = async (filename: string, content: string) => {
  console.log(`Writing ${filename} context file via WriteToContext API`);
  try {
    const response = await fetch(`/api/History/MarkDown/Write`, {
      method: "POST",
      body: JSON.stringify({ filename, content }),
    });
    const data = await response.json();
    console.log("WriteToContext API Response", data);
    // example of data is
    // {
    //     "success": true,
    //     "filename": "file1.md",
    //     "path": "path/to/file1.md"
    // }
    return data;
  } catch (error) {
    console.error("Error writing to context:", error);
    return null;
  }
};

// Conversation History APIs/////////////////////////////////////////////////////////

// Read API
export const ReadConversationHistory = async () => {
  console.log("Reading conversation history via ReadConversationHistory API");
  try {
    const response = await fetch(`/api/History/ConversationHistory/Read`);
    const data = await response.json();
    console.log("ReadConversationHistory API Response", data);
    // example of data is
    // {
    //     "conversationHistory": [conversationHistory]
    // }
    return data;
  } catch (error) {
    console.error("Error reading conversation history:", error);
    return null;
  }
};

// Write API
export const AddNewMessagesToConversationHistory = async (
  conversationHistory: conversationHistory[]
) => {
  console.log(
    "Adding new messages to conversation history via AddNewMessagesToConversationHistory API"
  );
  try {
    const response = await fetch(`/api/History/ConversationHistory/Write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationHistory }),
    });
    const data = await response.json();
    console.log("AddNewMessagesToConversationHistory API Response", data);
    // example of data is
    // {
    //     "message": "Conversation history saved",
    //     "newMessagesCount": 5
    //     "newMessages": [newMessages]
    // }
    return data;
  } catch (error) {
    console.error("Error adding new messages to conversation history:", error);
    return null;
  }
};
