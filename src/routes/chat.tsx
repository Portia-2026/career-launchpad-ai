import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2, Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { chatReply } from "@/lib/ai.functions";
import { useSession } from "@/lib/session-store";
import { PageHeader } from "./email";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Career Chatbot — Youth Career Launchpad" },
      {
        name: "description",
        content:
          "Chat with an AI career coach about CVs, interviews, internships, and South African workplaces.",
      },
    ],
  }),
  component: ChatPage,
});

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

const suggestions = [
  "Explain the Helpdesk Technician role.",
  "Interview questions for a Data Analyst.",
  "How can I improve my CV?",
  "What are entry-level IT jobs?",
  "Explain a Polymer Research and Development career.",
  "Polymer vacancies in Research and Development.",
  "How do I prepare for a graduate interview?",
  "What skills should I learn in 2026?",
];

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const logActivity = useSession((s) => s.logActivity);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const mutation = useMutation({
    mutationFn: async (history: ChatMessage[]) =>
      chatReply({
        data: { messages: history.map((m) => ({ role: m.role, content: m.content })) },
      }),
    onSuccess: (res) => {
      setMessages((ms) => [
        ...ms,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.text,
          timestamp: Date.now(),
        },
      ]);
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Unable to generate a response right now.";
      toast.error("Something went wrong", { description: msg });
    },
  });

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    logActivity({ type: "chat", title: trimmed.slice(0, 60) });
    mutation.mutate(next);
  };

  const clear = () => setMessages([]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          icon={MessageSquare}
          title="AI Career Chatbot"
          description="Your supportive workplace assistant — ask anything about your career."
        />
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clear} className="gap-1">
            <Trash2 className="h-4 w-4" /> Clear Chat
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-border shadow-soft">
        <CardContent className="flex h-[62vh] min-h-[420px] flex-col gap-0 p-0">
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <EmptyChat onPick={send} />
            ) : (
              <div className="flex flex-col gap-5">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))}
                </AnimatePresence>
                {mutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-background/60 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about CVs, interviews, internships, careers…"
                rows={1}
                className="min-h-[44px] resize-none rounded-xl"
              />
              <Button
                onClick={() => send(input)}
                disabled={!input.trim() || mutation.isPending}
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChat({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold">Ask the AI Career Assistant anything</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try one of these or type your own question below.
        </p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground/90 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className={`flex min-w-0 max-w-[85%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-soft">
            {message.content}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground prose-p:my-2 prose-headings:font-display prose-headings:mt-3 prose-headings:mb-2 prose-strong:text-foreground prose-a:text-primary prose-li:my-0.5 prose-ul:my-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <span className="px-1 text-[10px] text-muted-foreground">{time}</span>
      </div>
    </motion.div>
  );
}
