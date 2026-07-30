'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { matchFaq, type FaqAnswer } from '@/lib/chatbotFaq';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  links?: FaqAnswer['links'];
};

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: "Bonjour ! Je suis l'assistant YAS Career. Posez une question (ex. « comment postuler ? ») ou choisissez une suggestion.",
  links: [
    { label: 'Voir les offres', href: '/offres' },
    { label: 'Créer un compte', href: '/register' },
  ],
};

const SUGGESTIONS = [
  'Comment postuler ?',
  'Où voir mes candidatures ?',
  'Comment rejoindre un entretien ?',
  'Créer un compte',
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);

  const reply = (question: string) => {
    const answer = matchFaq(question);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: question },
      {
        id: `b-${Date.now() + 1}`,
        role: 'bot',
        text: answer.text,
        links: answer.links,
      },
    ]);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    reply(q);
  };

  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between bg-yas-midnight px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Assistant YAS</p>
              <p className="text-xs text-white/70">Questions fréquentes</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <X />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.links && m.links.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {m.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-yas-midnight underline-offset-2 hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          <ExternalLink size={12} />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => reply(s)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              className="h-9"
            />
            <Button type="submit" size="icon" className="shrink-0" aria-label="Envoyer">
              <Send />
            </Button>
          </form>
        </div>
      )}
      <Button
        size="lg"
        className="h-12 gap-2 rounded-full px-4 font-semibold shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Ouvrir l'assistant"
      >
        <MessageCircle />
        Aide
      </Button>
    </div>
  );
}
