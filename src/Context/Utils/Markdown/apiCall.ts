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

  WriteNewToContext: async (content: string, filename?: string) => {
    console.log(`WriteToContext API Call starting`);

    if (content === "") {
      console.log(
        "Content received by WriteNewToContext API is empty, skipping write"
      );
      return;
    }
    if (!filename) {
      filename = `Context_${new Date()
        .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        .replace(/[/:\s]/g, "-")}`;
      console.log(
        "Filename is not provided, using current timestamp as filename",
        filename
      );
    }
    if (filename.length > 250) {
      console.log(
        `File name is too Long ${filename.length} characters, using current timestamp as filename`,
        filename
      );
      filename = `Context_${new Date()
        .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        .replace(/[/:\s]/g, "-")}`;
    }

    try {
      const response = await fetch(`/api/Context/MarkDown/Write`, {
        method: "POST",
        body: JSON.stringify({ filename: filename + ".md", content }),
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
