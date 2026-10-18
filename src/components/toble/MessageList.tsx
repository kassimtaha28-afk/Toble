import type { UIMessage } from "ai";
import { Check, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TobleMark } from "./Logo";

const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Copy response"
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

export function MessageList({
  messages, busy, waiting, error, onRegenerate, onRetry,
}: {
  messages: UIMessage[]; busy: boolean; waiting: boolean; error?: string | undefined;
  onRegenerate: () => void; onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8" role="log" aria-live="polite">
      {messages.map((m, i) =>
        m.role === "user" ? (
          <div key={m.id} className="flex justify-end animate-fade-up">
            <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-bubble-user px-4 py-2.5 text-[15px] text-bubble-user-foreground">{textOf(m)}</div>
          </div>
        ) : (
          <div key={m.id} className="group flex gap-3 animate-fade-up">
            <TobleMark className="mt-0.5 size-7 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="prose prose-sm max-w-none text-[15px] text-foreground dark:prose-invert prose-pre:rounded-xl prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-table:text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: (p) => <a {...p} target="_blank" rel="noreferrer" /> }}>
                  {textOf(m)}
                </ReactMarkdown>
              </div>
              {!(busy && i === messages.length - 1) && textOf(m) && (
                <div className="mt-1 flex gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                  <CopyButton text={textOf(m)} />
                  {i === messages.length - 1 && (
                    <button onClick={onRegenerate} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Regenerate response">
                      <RotateCcw className="size-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      )}
      {waiting && (
        <div className="flex items-center gap-3" aria-label="Toble is thinking">
          <TobleMark className="size-7 shrink-0" />
          <span className="flex gap-1">
            {[0, 150, 300].map((d) => (
              <span key={d} className="size-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        </div>
      )}
      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span className="flex-1">{error}</span>
          <button onClick={onRetry} className="rounded-lg border border-destructive/30 px-3 py-1 font-medium hover:bg-destructive/10">Retry</button>
        </div>
      )}
    </div>
  );
}
