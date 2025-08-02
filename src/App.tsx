import { useState, useEffect, useRef } from "react";

// Main App component
const App = () => {
  // State for IP address and model name
  const [ipAddress, setIpAddress] = useState("192.168.1.100"); // Updated default IP
  const [modelName, setModelName] = useState("qwen2.5-coder:0.5b");

  // State for chat messages, user input, and loading status
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reference for the chat container to auto-scroll to the bottom
  const chatContainerRef = useRef(null);

  // Effect to scroll to the bottom of the chat when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message submission
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: "user", content: inputMessage };
    const newMessages = [...messages, userMessage];

    // Add user message and a placeholder for the model's response
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`http://${ipAddress}:11434/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          prompt: inputMessage,
          stream: true,
        }),
      });

      if (!response.body) {
        throw new Error("Streaming not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let modelResponseContent = "";

      // Add a new message for the model's response
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "model", content: "" },
      ]);

      // Read the stream and update the last message in state
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Split chunk by newline to process each JSON object separately
        const jsonChunks = chunk.split("\n").filter(Boolean);

        for (const json of jsonChunks) {
          try {
            const data = JSON.parse(json);
            if (data.response) {
              modelResponseContent += data.response;
              setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1].content =
                  modelResponseContent;
                return updatedMessages;
              });
            }
          } catch (error) {
            console.error("Failed to parse JSON chunk:", error);
          }
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "model",
          content: `Error: Could not connect to the server. Please check the IP address and ensure the server is running. (${error.message})`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-inter p-4">
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-800 rounded-xl shadow-lg mb-4">
        <div className="flex-1 w-full sm:w-auto mb-2 sm:mb-0 sm:mr-4">
          <label className="text-sm font-medium text-gray-400">
            Ollama Host IP
          </label>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 192.168.1.100"
          />
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-400">
            Model Name
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., llama3"
          />
        </div>
      </div>

      {/* Chat Messages Display */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 rounded-xl shadow-inner mb-4"
      >
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500 text-center text-lg">
              Start a conversation by typing a message below.
            </span>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-xl shadow-md ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] px-4 py-2 rounded-xl shadow-md bg-gray-700 text-gray-100 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-fast" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-fast animation-delay-150" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-fast animation-delay-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="flex p-4 bg-gray-800 rounded-xl shadow-lg"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-2 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-r-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-600"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default App;
