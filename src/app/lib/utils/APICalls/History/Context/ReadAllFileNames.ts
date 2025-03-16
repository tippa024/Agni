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
