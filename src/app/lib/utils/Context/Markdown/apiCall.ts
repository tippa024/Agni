export const MarkdownAPI = {
  ReadAllContextFileNamesOnly: async () => {
    console.log(
      "Reading all context file names via ReadAllContextFileNames API"
    );
    try {
      const response = await fetch(
        "/api/Context/MarkDown/Read?includeContent=false"
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
  },

  ReadAllContextFilesNamesAndContent: async () => {
    console.log("Reading all context files via ReadAllContextFiles API");
    try {
      const response = await fetch(
        "/api/Context/MarkDown/Read?includeContent=true"
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
  },

  ReadAParticularContextFile: async (filename: string) => {
    console.log(
      `Reading ${filename} context file via ReadAParticularContextFile API`
    );
    try {
      const response = await fetch(
        `/api/Context/MarkDown/Read?filename=${filename}`
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
  },

  WriteNewToContext: async (filename: string, content: string) => {
    console.log(
      `WriteToContext API Call starting` + "\n\n" + filename + "\n\n" + content
    );
    try {
      const response = await fetch(`/api/Context/MarkDown/Write`, {
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
  },
};
