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
