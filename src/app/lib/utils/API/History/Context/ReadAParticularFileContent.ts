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
