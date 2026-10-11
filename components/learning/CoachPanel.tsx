"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  LoaderCircle,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";
import {
  coachAnswerSchema,
  suggestedStep,
  type CoachAnswer,
} from "@/lib/learning/coach";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";
import {
  recordLearningActivity,
  useLearningStore,
  type CoachContext,
} from "@/lib/learning/store";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  answer?: CoachAnswer;
  source?: string;
};

function MicroQuiz({
  quiz,
  id,
}: {
  quiz: NonNullable<CoachAnswer["quiz"]>;
  id: string;
}) {
  const { student } = useStudyOverview();
  const [selected, setSelected] = useState<number | null>(null);
  const answered = useRef(false);
  return (
    <div className="mt-4 rounded-2xl border border-primary/15 bg-white/80 p-4">
      <p className="study-eyebrow">UNA MINI VICTORIA · {quiz.skill}</p>
      <p className="mt-2 whitespace-pre-line text-sm font-semibold">
        {quiz.question}
      </p>
      <div className="mt-3 grid gap-2">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            disabled={selected !== null}
            onClick={() => {
              if (answered.current) return;
              answered.current = true;
              setSelected(index);
              void recordLearningActivity(student?.username ?? null, {
                id: `coach:${id}`,
                kind: "question",
                skill: quiz.skill,
                label: `Microreto del coach · ${quiz.skill}`,
              });
            }}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${selected !== null && index === quiz.correctIndex ? "border-[#658b6b] bg-[#e6f1e7] text-[#35563c]" : selected === index ? "border-primary/50 bg-accent/30" : "hover:bg-muted"}`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            <span>{option}</span>
            {selected !== null && index === quiz.correctIndex && (
              <Check size={14} className="ml-auto shrink-0" />
            )}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div role="status" className="mt-3 text-xs leading-relaxed">
          <p className="mb-1 font-bold">
            {selected === quiz.correctIndex
              ? "¡Encontraste la pista!"
              : "Nueva pista para tu próxima respuesta:"}
          </p>
          {quiz.explanation}
        </div>
      )}
    </div>
  );
}

export function CoachPanel({
  context,
  compact = false,
}: {
  context?: CoachContext | null;
  compact?: boolean;
}) {
  const overview = useStudyOverview();
  const { coachSummary, ready } = overview;
  const step = suggestedStep(coachSummary);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const sending = useRef(false);
  const list = useRef<HTMLDivElement>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages, busy]);

  async function ask(text: string) {
    if (sending.current || !text.trim() || !ready) return;
    sending.current = true;
    setBusy(true);
    setError(null);
    setInput("");
    const question = text.trim().slice(0, 1200);
    const history = messages
      .slice(-6)
      .map((message) => ({
        role: message.role,
        text: message.text.slice(0, 4000),
      }));
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: question },
    ]);
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 50000);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          message: question,
          summary: coachSummary,
          context: context
            ? {
                ...context,
                question: context.question.slice(0, 4000),
                explanation: context.explanation?.slice(0, 4000),
              }
            : null,
          history,
        }),
      });
      if (!response.ok)
        throw new Error("No se pudo consultar al coach. Inténtalo de nuevo.");
      const data = await response.json();
      const answer = coachAnswerSchema.parse(data);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `${answer.message}\n${answer.steps.join("\n")}\n${answer.example}`,
          answer,
          source: data.source,
        },
      ]);
    } catch {
      if (!abort.signal.aborted || controller.current === abort)
        setError(
          "No logré conectarme ahora. Puedes volver a intentar o continuar con tu misión recomendada.",
        );
    } finally {
      clearTimeout(timeout);
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      className={compact ? "" : "study-card"}
      aria-label="Mi coach de estudio"
    >
      {!compact && (
        <>
          <p className="study-eyebrow flex items-center gap-1.5">
            <Sparkles size={13} /> TU COACH PERSONAL
          </p>
          <h2 className="mt-1 text-xl">No tienes que descifrarlo a solas.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Un plan a tu medida, ejemplos nuevos y pistas para entender tus
            errores.
          </p>
        </>
      )}
      {context && (
        <div className="mt-2 rounded-xl bg-muted px-3 py-2 text-xs">
          <strong>Estamos trabajando en:</strong>{" "}
          <span className="line-clamp-2">{context.question}</span>
        </div>
      )}
      <div
        ref={list}
        className={`${compact ? "max-h-[42dvh]" : "max-h-[400px]"} mt-4 space-y-3 overflow-y-auto overscroll-contain pr-1`}
        role="log"
        aria-live="polite"
        aria-label="Conversación con el coach"
      >
        {messages.length === 0 && (
          <div className="rounded-2xl rounded-tl-sm bg-[#f0ede7] p-4 text-sm leading-relaxed text-[#65434a]">
            <p>
              {context
                ? "Trajiste una buena pregunta. Puedo explicarte la pista, mostrar un ejemplo paralelo y proponerte un pequeño reto."
                : overview.stats.goalMet
                  ? "Ya cumpliste tu meta. Podemos repasar una duda concreta o cerrar por hoy: descansar ayuda a consolidar lo aprendido."
                  : overview.entries.length
                    ? `Tienes ${overview.entries.length} temas en tu Cuaderno. No hace falta resolverlos todos: empecemos por uno.`
                    : "¿Poco tiempo, una duda de Grammar o un día difícil? Cuéntame y buscamos un siguiente paso que sí te sirva."}
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl p-4 text-sm leading-relaxed ${message.role === "user" ? "ml-8 rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted/70"}`}
          >
            {message.answer ? (
              <>
                <p className="whitespace-pre-line">{message.answer.message}</p>
                <ol className="mt-3 space-y-2">
                  {message.answer.steps.map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {message.answer.example && (
                  <p className="mt-3 whitespace-pre-line rounded-xl border-l-2 border-primary/30 bg-white/70 p-3 text-xs">
                    {message.answer.example}
                  </p>
                )}
                {message.answer.quiz && (
                  <MicroQuiz quiz={message.answer.quiz} id={message.id} />
                )}
                {message.source === "local" && (
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Guía local · la conexión de IA no está disponible en este
                    momento.
                  </p>
                )}
              </>
            ) : (
              <p className="whitespace-pre-line">{message.text}</p>
            )}
          </div>
        ))}
        {busy && (
          <p
            role="status"
            className="flex items-center gap-2 p-2 text-xs text-muted-foreground"
          >
            <LoaderCircle className="animate-spin" size={14} />
            Buscando una explicación que haga clic…
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(context
          ? ["Explícame la pista con otro ejemplo", "Dame un microreto similar"]
          : [
              "Hoy solo tengo 5 minutos",
              "Ayúdame con Grammar C1",
              "Estoy atascada, ¿por dónde sigo?",
            ]
        ).map((prompt) => (
          <button
            key={prompt}
            disabled={busy || !ready}
            onClick={() => void ask(prompt)}
            className="rounded-full border bg-white/60 px-3 py-2 text-left text-[11px] font-medium transition hover:bg-secondary/40 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
        className="mt-3 flex items-end gap-2 rounded-2xl border bg-white/70 p-2"
      >
        <label
          className="sr-only"
          htmlFor={compact ? "coach-dialog-input" : "coach-home-input"}
        >
          Tu pregunta al coach
        </label>
        <textarea
          id={compact ? "coach-dialog-input" : "coach-home-input"}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={1200}
          rows={2}
          placeholder="Tengo una duda sobre…"
          className="min-w-0 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label="Enviar pregunta al coach"
          disabled={!input.trim() || busy || !ready}
          className="rounded-full bg-primary p-2.5 text-primary-foreground transition disabled:opacity-40"
        >
          <ArrowUp size={18} />
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <Link
        href={step.href}
        onClick={() => useLearningStore.getState().closeCoach()}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
      >
        {step.action}
        <ArrowUpRight size={14} />
      </Link>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Al consultar se envían tu duda, este ejercicio y un resumen de progreso
        a la IA; no tu nombre ni tus grabaciones. Puede equivocarse: contrasta
        la explicación. La conversación es temporal.
      </p>
    </section>
  );
}
