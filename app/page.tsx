"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        const err = await res.text();
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: `Error (${res.status}): ${err}` },
        ]);
        return;
      }

      const text = (await res.text()).trim();
      setMessages([...updatedMessages, { role: "assistant", content: text }]);
    } catch (e: any) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: `Network error: ${e?.message ?? String(e)}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">🧠 AI Chat</h1>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl whitespace-pre-wrap break-words ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-white text-gray-500 border border-gray-200 italic">
              AI is typing…
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask something…"
          className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring focus:ring-blue-300 bg-white"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  );
}
