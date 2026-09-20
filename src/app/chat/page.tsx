"use client";

import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  confidence: number | null;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        const list: Conversation[] = data.conversations || [];
        setConversations(list);
        if (list.length > 0) {
          selectConversation(list[0].id);
        }
      })
      .finally(() => setLoadingList(false));
  }, []);

  function selectConversation(id: string) {
    setActiveId(id);
    setLoadingMessages(true);
    fetch(`/api/chat/${id}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .finally(() => setLoadingMessages(false));
  }

  async function handleNewChat() {
    setErrorMessage("");
    try {
      const res = await fetch("/api/chat", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create a new chat");

      setConversations((prev) => [data.conversation, ...prev]);
      setActiveId(data.conversation.id);
      setMessages([]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleSend() {
    if (!input.trim()) return;
    setErrorMessage("");

    let conversationId = activeId;
    const wasFirstMessage = messages.length === 0;

    if (!conversationId) {
      try {
        const res = await fetch("/api/chat", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not start a new chat");
        conversationId = data.conversation.id;
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveId(conversationId);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
        return;
      }
    }

    const userText = input;
    const optimisticUserMessage: Message = {
      id: "temp-" + Date.now(),
      role: "user",
      text: userText,
      confidence: null,
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setMessages((prev) => [...prev, data.message]);

      if (wasFirstMessage) {
        const listRes = await fetch("/api/chat");
        const listData = await listRes.json();
        setConversations(listData.conversations || []);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong sending that message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <AppNavbar active="Chat" />

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-64 flex-shrink-0 rounded-2xl border border-navy/10 bg-white p-4 md:block">
          <h3 className="text-sm font-semibold text-navy">Conversations</h3>
          <div className="mt-3 space-y-1">
            {loadingList ? (
              <p className="text-sm text-foreground/40">Loading</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-foreground/40">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={
                    "block w-full rounded-lg px-3 py-2 text-left " +
                    (c.id === activeId ? "bg-teal-light" : "hover:bg-navy/5")
                  }
                >
                  <p
                    className={
                      "truncate text-sm " +
                      (c.id === activeId ? "font-semibold text-navy" : "text-foreground/80")
                    }
                  >
                    {c.title}
                  </p>
                </button>
              ))
            )}
          </div>
          <button
            onClick={handleNewChat}
            className="mt-4 w-full rounded-full border border-navy/20 py-2 text-sm font-medium text-navy hover:bg-navy/5"
          >
            New chat
          </button>
        </aside>

        <div className="flex min-h-[600px] flex-1 flex-col">
          <p className="font-display text-2xl text-navy">Ask MediUnify</p>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
            {loadingMessages ? (
              <p className="text-sm text-foreground/50">Loading conversation</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-foreground/50">
                No messages yet, ask something below to get started.
              </p>
            ) : (
              messages.map((m) => (
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
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-purple-light px-4 py-3 text-sm text-foreground/50">
                  Thinking
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-3 rounded-xl bg-coral-light px-4 py-3 text-sm text-foreground">
              {errorMessage}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-full border border-navy/20 bg-white px-4 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
              placeholder="Ask a health question"
              disabled={sending}
              className="flex-1 bg-transparent text-sm outline-none disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-white hover:bg-teal-dark disabled:opacity-60"
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