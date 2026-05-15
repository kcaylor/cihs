"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  QUESTIONS,
  SCALE_LABELS,
  REVERSE_SCORED,
  computeResults,
  interpret,
  type Answers,
  type Rating,
} from "../lib/cihs";

const STORAGE_KEY = "cihs:v1";

type Persisted = { name: string; answers: Answers };

function loadPersisted(): Persisted {
  if (typeof window === "undefined") return { name: "", answers: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: "", answers: {} };
    const parsed = JSON.parse(raw) as Persisted;
    return { name: parsed.name ?? "", answers: parsed.answers ?? {} };
  } catch {
    return { name: "", answers: {} };
  }
}

const TONE_STYLES: Record<string, string> = {
  "very-high": "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-900",
  strong: "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/40 dark:text-sky-100 dark:border-sky-900",
  moderate: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900",
  lower: "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-100 dark:border-orange-900",
  rigid: "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-900",
};

export default function Assessment() {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const { name: n, answers: a } = loadPersisted();
    setName(n);
    setAnswers(a);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, answers }));
  }, [name, answers, hydrated]);

  const results = useMemo(() => computeResults(answers), [answers]);
  const answeredCount = results.answeredCount;
  const progressPct = Math.round((answeredCount / 22) * 100);
  const allAnswered = answeredCount === 22;
  const overallBand = allAnswered ? interpret(results.overall.average) : null;

  function setAnswer(id: number, value: Rating) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function reset() {
    if (!confirm("Clear all answers and start over?")) return;
    setAnswers({});
    setName("");
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function jumpToFirstUnanswered() {
    const firstUnanswered = QUESTIONS.find((q) => answers[q.id] === undefined);
    if (firstUnanswered) {
      document.getElementById(`q-${firstUnanswered.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function scrollToResults() {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copySummary() {
    const lines: string[] = [];
    lines.push("Comprehensive Intellectual Humility Scale (CIHS) — Results");
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push("");
    for (const s of results.subscales) {
      lines.push(`${s.key}. ${s.name}: ${s.average.toFixed(2)} (sum ${s.sum} / ${s.divisor})`);
    }
    lines.push("");
    lines.push(`Overall CIHS: ${results.overall.average.toFixed(2)} (sum ${results.overall.sum} / 22)`);
    if (overallBand) lines.push(`Level: ${overallBand.level} — ${overallBand.summary}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(lines.join("\n"));
    }
  }

  function printResults() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Strategic Planning · Self-Assessment
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Comprehensive Intellectual Humility Scale
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Respond to the 22 items below based on how you{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">actually</span> think and behave,
          not how you wish you did. Your answers stay in this browser — nothing is sent anywhere.
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          Scale developed by Krumrei-Mancuso &amp; Rouse.
        </p>
      </header>

      <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 print:hidden">
        <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Your name (optional, for the shared summary)
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Rivera"
          className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div
        className="sticky top-0 z-10 -mx-4 mb-6 border-b border-zinc-200 bg-zinc-50/90 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 sm:-mx-6 sm:px-6 print:hidden"
        aria-label="Progress"
      >
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{answeredCount}</span>
            <span className="mx-1">/</span>
            <span>22 answered</span>
          </span>
          <div className="flex items-center gap-2">
            {!allAnswered && answeredCount > 0 && (
              <button
                type="button"
                onClick={jumpToFirstUnanswered}
                className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Next unanswered
              </button>
            )}
            {allAnswered && (
              <button
                type="button"
                onClick={scrollToResults}
                className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                View results ↓
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-100"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ol className="space-y-4 print:hidden">
        {QUESTIONS.map((q) => {
          const current = answers[q.id];
          const isReverse = REVERSE_SCORED.has(q.id);
          return (
            <li
              key={q.id}
              id={`q-${q.id}`}
              className={`rounded-lg border bg-white p-4 shadow-sm transition-colors dark:bg-zinc-900 ${
                current !== undefined
                  ? "border-zinc-300 dark:border-zinc-700"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {q.id}
                </span>
                <p className="text-sm leading-6 text-zinc-900 dark:text-zinc-100">{q.text}</p>
              </div>
              <fieldset className="mt-3">
                <legend className="sr-only">Rating for item {q.id}</legend>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {SCALE_LABELS.map((opt) => {
                    const selected = current === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`group flex cursor-pointer flex-col items-center justify-center rounded-md border px-1 py-2 text-center transition ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.value}
                          checked={selected}
                          onChange={() => setAnswer(q.id, opt.value)}
                          className="sr-only"
                        />
                        <span className="text-base font-semibold leading-none">{opt.value}</span>
                        <span className="mt-1 text-[10px] leading-tight sm:text-xs">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
                {isReverse && (
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Reverse scored
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div ref={resultsRef} className="mt-10 scroll-mt-20">
        <div
          className={`rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 ${
            allAnswered
              ? "border-zinc-300 dark:border-zinc-700"
              : "border-dashed border-zinc-300 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Your results</h2>
            {!allAnswered && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {22 - answeredCount} item{22 - answeredCount === 1 ? "" : "s"} remaining
              </span>
            )}
          </div>

          {name.trim() && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{name.trim()}</p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {results.subscales.map((s) => (
              <div
                key={s.key}
                className={`rounded-lg border p-4 ${
                  s.complete
                    ? "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                    : "border-dashed border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Subscale {s.key}
                </p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.name}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {s.complete ? s.average.toFixed(2) : "—"}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    sum {s.sum} / {s.divisor}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Overall CIHS
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                sum {results.overall.sum} / 22
              </p>
            </div>
            <p className="mt-2 text-4xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {allAnswered ? results.overall.average.toFixed(2) : "—"}
            </p>
          </div>

          {overallBand && (
            <div className={`mt-5 rounded-lg border p-4 ${TONE_STYLES[overallBand.tone]}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Interpretation</p>
              <p className="mt-1 text-base font-semibold">{overallBand.level}</p>
              <p className="mt-1 text-sm leading-6">{overallBand.summary}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={copySummary}
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={printResults}
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={reset}
              className="ml-auto inline-flex items-center gap-2 rounded-md border border-transparent px-3.5 py-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Reset
            </button>
          </div>
        </div>

        <details className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900 print:hidden">
          <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
            How scoring works
          </summary>
          <div className="mt-3 space-y-2 text-zinc-600 dark:text-zinc-400">
            <p>
              Items 1, 3, 5, 18, 19, 20, and 21 are reverse scored — your raw response is replaced with{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">6 − response</code> before
              summing.
            </p>
            <p>The four subscales are averaged independently; the overall score is the average of all 22 final scores.</p>
            <ul className="ml-4 list-disc space-y-0.5 text-xs">
              <li>4.5 – 5.0 — Very High</li>
              <li>3.8 – 4.4 — Strong</li>
              <li>3.0 – 3.7 — Moderate</li>
              <li>2.0 – 2.9 — Lower</li>
              <li>Below 2.0 — Rigid</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}
