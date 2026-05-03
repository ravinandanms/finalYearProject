import { useState } from "react";
import { checkSymptoms } from "../gemini";

export default function AISymptomChecker({ onBackHome }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋 I'm your AI assistant. Describe your symptoms." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndexes, setExpandedIndexes] = useState({});

  const toggleExpand = (idx) => {
    setExpandedIndexes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const sendMessage = async () => {
    if (isLoading) return;
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");

    const userMsg = { sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    const typingMsg = { sender: "bot", text: "Thinking…" };
    const typingIndex = messages.length + 1;
    setMessages((prev) => [...prev, typingMsg]);

    try {
      const responseText = await checkSymptoms(userText);
      setMessages((prev) => {
        const next = [...prev];
        next[typingIndex] = { sender: "bot", text: responseText };
        return next;
      });
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[typingIndex] = {
          sender: "bot",
          text: "Sorry, I couldn't get a response right now. Please try again.",
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const MAX_CHARS = 500;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackHome}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-slate-800">AI Symptom Checker</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => {
              const isUser = msg.sender === "user";
              const isLong = msg.text.length > MAX_CHARS;
              const isExpanded = !!expandedIndexes[i];
              const displayText = isLong && !isExpanded ? msg.text.slice(0, MAX_CHARS) + "…" : msg.text;

              return (
                <div key={i} className={`p-4 rounded-lg max-w-[80%] ${isUser ? "bg-green-500 text-white ml-auto" : "bg-gray-100 text-slate-700"}`}>
                  <div className="whitespace-pre-wrap break-words">{displayText}</div>
                  {!isUser && isLong && (
                    <button
                      className="mt-2 text-xs text-green-600 hover:text-green-700"
                      onClick={() => toggleExpand(i)}
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder="Type your symptoms..."
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-60 transition-colors font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
