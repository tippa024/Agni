export const WriteNewToContext = async (filename: string, content: string) => {
  console.log(`WriteToContext API Call starting` + filename + content);
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
    console.log("WriteToContext API Call completed");
    return data;
  } catch (error) {
    console.error("Error writing to context:", error);
    return null;
  }
};
