"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { chatbotApi } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Bonjour ! Je suis l'assistant YasCareer. Posez-moi vos questions sur les offres, les candidatures ou les entretiens.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || pending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPending(true);

    try {
      const result = await chatbotApi.sendMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: String(result.messageId), role: "assistant", content: result.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Désolé, je n'ai pas pu répondre. Réessayez dans un instant.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between bg-yas-midnight px-4 py-3 text-white">
            <div>
              <p className="font-heading text-sm font-semibold">Assistant YasCareer</p>
              <p className="text-xs text-white/70">Réponses instantanées</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le chat"
              className="rounded-md p-1 hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto rounded-br-sm bg-yas-yellow text-yas-midnight"
                    : "mr-auto rounded-bl-sm bg-muted text-foreground"
                )}
              >
                {m.content}
              </div>
            ))}
            {pending && (
              <div className="mr-auto flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Écrit...
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 border-t p-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Écrivez votre message..."
              rows={1}
              className="min-h-9 resize-none"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={pending || !input.trim()}
              className="shrink-0 bg-yas-midnight hover:bg-yas-midnight/90"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Button
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ouvrir le chat"
        className="size-14 rounded-full bg-yas-yellow text-yas-midnight shadow-lg hover:bg-yas-yellow/90"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </Button>
    </div>
  );
}
