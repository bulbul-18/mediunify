"use client";

import { useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  confidence?: number;
};

const CONVERSATIONS = [
  { title: "Ibuprofen interaction", date: "Today", active: true },
  { title: "Headache follow-up", date: "Mar 5", active: false },
  { title: "Diet questions", date: "Feb 22", active: false },
];

const INITIAL_MESSAGES: Message[] = [
  { id: "1", role: "user", text: "Is it okay to take ibuprofen with my prescription?" },
  {
    id: "2",
    role: "ai",
    text: "Based on your Amoxicillin prescription (Feb 28), there's no known interaction with ibuprofen.",
    confidence: 0.76,
  },
  { id: "3", role: "user", text: "Should I still see a doctor?" },
  {
    id: "4",
    role: "ai",
    text: "Not urgently, but if the headache lasts beyond 48 hours, a check-up is a good idea.",
    confidence: 0.71,
  },
];

function mockReply(): Message {
  return {
    id: crypto.randomUUID(),
    role: "ai",
    text: "Based on what's in your record so far, that looks fine, but let me know if symptoms change or worsen.",
    confidence: 0.68,
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, mockReply()]);
      setSending(false);
    }, 900);
  }

  return (
    <div className="min-h-full bg-background">
      <AppNavbar active="Chat" />

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-64 flex-shrink-0 rounded-2xl border border-navy/10 bg-white p-4 md:block">
          <h3 className="text-sm font-semibold text-navy">Conversations</h3>
          <div className="mt-3 space-y-1">
            {CONVERSATIONS.map((c) => (
              <div
                key={c.title}
                className={
                  "cursor-pointer rounded-lg px-3 py-2 " +
                  (c.active ? "bg-teal-light" : "hover:bg-navy/5")
                }
              >
                <p
                  className={
                    "text-sm " + (c.active ? "font-semibold text-navy" : "text-foreground/80")
                  }
                >
                  {c.title}
                </p>
                <p className="text-xs text-foreground/40">{c.date}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-full border border-navy/20 py-2 text-sm font-medium text-navy hover:bg-navy/5">
            New chat
          </button>
        </aside>

        <div className="flex min-h-[600px] flex-1 flex-col">
          <p className="font-display text-2xl text-navy">Ask MediUnify</p>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={
                    "max-w-md rounded-2xl px-4 py-3 text-sm " +
                    (m.role === "user"
                      ? "bg-teal text-white"
                      : "bg-purple-light text-foreground")
                  }
                >
                  <p>{m.text}</p>
                  {m.confidence != null && (
                    <div className="mt-2">
                      <ConfidenceBadge confidence={m.confidence} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-purple-light px-4 py-3 text-sm text-foreground/50">
                  Thinking
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-full border border-navy/20 bg-white px-4 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a health question"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              onClick={handleSend}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-white hover:bg-teal-dark"
              aria-label="Send"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}