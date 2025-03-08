export default function ReadContextFiles() {
  return (
    <div className="flex-1 flex items-top justify-center">
      <div className="flex flex-col items-center">
        <button
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium transition-colors"
          onClick={() => {
            fetch("/api/History/MarkDown/Read")
              .then((response) => response.json())
              .then((data) => {
                if (data.files && Array.isArray(data.files)) {
                  alert(`Available context files:\n${data.files.join("\n")}`);
                } else {
                  alert("No context files found or error retrieving files");
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                alert("Error retrieving context files");
              });
          }}
        >
          Show Context Files
        </button>
      </div>
    </div>
  );
}
