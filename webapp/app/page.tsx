"use client";

import { FormEvent, useState } from "react";

type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "bot",
      text: "Yooo! Dev siap nemenin kamu mikir!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setError(null);

    const newUserMessage: Message = {
      id: Date.now(),
      from: "user",
      text: question
    };
    setMessages(prev => [...prev, newUserMessage]);

    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Gagal memanggil webhook n8n");
      }

      const data = await res.json();
      const answerText =
        typeof data.answer === "string"
          ? data.answer
          : typeof data === "string"
          ? data
          : JSON.stringify(data, null, 2);

      const botMessage: Message = {
        id: Date.now() + 1,
        from: "bot",
        text: answerText
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan tak diketahui");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="chat-container">
        <header className="chat-header">
          <div className="chat-header-title">Dev AI</div>
          <p className="chat-header-subtitle">
            Smart help, fast solution
          </p>
        </header>

        <main className="chat-main">
          <div className="chat-messages">
            {messages.map(message => {
              const isUser = message.from === "user";
              return (
                <div
                  key={message.id}
                  className={`chat-row ${isUser ? "chat-row-user" : "chat-row-bot"}`}
                >
                  <div
                    className={`chat-bubble ${
                      isUser ? "chat-bubble-user" : "chat-bubble-bot"
                    }`}
                  >
                    {message.text}
                    <span className="chat-meta">
                      {isUser ? "Kamu" : "Bot • n8n + OpenAI"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {error && <div className="chat-error">{error}</div>}
        </main>

        <form onSubmit={handleSubmit} className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Tulis pertanyaan untuk dikirim ke n8n..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={loading || !input.trim()}
          >
            {loading ? "Mengirim..." : "Kirim"}
          </button>
        </form>

        <footer className="chat-footer">
          <span className="dot online" />
          <span className="chat-footer-text">
            Terhubung ke webhook n8n (set `N8N_WEBHOOK_URL` di .env.local)
          </span>
        </footer>
      </div>
    </div>
  );
}


