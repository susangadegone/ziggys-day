"use client";

import { useCallback, useEffect, useState } from "react";
import { BEATS, FINAL_DECISION, SCRIPT, TOTAL_BEATS, type AgentId } from "@/lib/script";
import { CAST } from "@/lib/agents";
import { AGREE_AT, DECIDERS, MAX_TURNS, ORDER } from "@/lib/personas";
import { PLACES, TWISTS, type PlaceId, type Weather } from "@/lib/world";
import World from "./World";
import { SCRIPTED_TWIST, entryFromBeat, newRunId, toJsonl, type LogEntry } from "@/lib/log";
import CharacterSlot from "./CharacterSlot";
import SpeechBubble, { type ShownLine } from "./SpeechBubble";
import DecisionLog, { type FinalRecord } from "./DecisionLog";

type Phase = "idle" | "running" | "thinking" | "finalizing" | "done";

interface Run {
  id: string;
  twist: string;
  mode: "live" | "scripted";
  weather: Weather;
  closed?: PlaceId;
}

// Latest agreement each agent has expressed so far.
function latestAgreement(entries: LogEntry[]): Partial<Record<AgentId, number>> {
  const out: Partial<Record<AgentId, number>> = {};
  for (const e of entries) out[e.agent] = e.agreement;
  return out;
}

function titleFor(e: LogEntry): string {
  if (e.mode === "scripted") return SCRIPT[e.turn - 1]?.title ?? "";
  if (e.action === "bark") return "The protest";
  return e.turn === 1 ? "Opening bids" : `Round ${e.turn}`;
}

export default function Stage() {
  const [live, setLive] = useState<{ live: boolean; provider: string | null } | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [final, setFinal] = useState<FinalRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [auto, setAuto] = useState(false);

  // Is a model key configured on the server?
  useEffect(() => {
    fetch("/api/final")
      .then((r) => r.json())
      .then(setLive)
      .catch(() => setLive({ live: false, provider: null }));
  }, []);

  const finish = useCallback(async (r: Run, all: LogEntry[]) => {
    const lat = latestAgreement(all);
    const satisfaction = ORDER.map((a) => ({ agent: a, score: lat[a] ?? 0 }));
    let record: FinalRecord;
    if (r.mode === "scripted") {
      record = { ...FINAL_DECISION, twist: r.twist };
    } else {
      setPhase("finalizing");
      try {
        const res = await fetch("/api/final", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ twist: r.twist, history: all }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        record = { plan: d.plan, timeline: d.timeline ?? [], winner: d.winner, why: d.why, satisfaction, twist: r.twist };
      } catch {
        record = { plan: "The recorder could not summarize this run.", timeline: [], satisfaction, twist: r.twist };
      }
    }
    setFinal(record);
    setPhase("done");
    // Append this run to decisions.jsonl (local dev only; failures ignored).
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(all),
    }).catch(() => {});
  }, []);

  const step = useCallback(
    async (r: Run, prev: LogEntry[]) => {
      const n = prev.length;
      let entry: LogEntry;

      if (r.mode === "scripted") {
        entry = entryFromBeat(BEATS[n], r.id);
      } else {
        const turn = Math.floor(n / 3) + 1;
        const agent = ORDER[n % 3];
        setPhase("thinking");
        setError(null);
        try {
          const res = await fetch("/api/line", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent,
              twist: r.twist,
              turn,
              history: prev.map(({ turn, agent, text }) => ({ turn, agent, text })),
            }),
          });
          const d = await res.json();
          if (!res.ok) throw new Error(d.error);
          const lat = { ...latestAgreement(prev), [agent]: d.agreement };
          const vals = Object.values(lat) as number[];
          const consensus = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100;
          entry = {
            run_id: r.id,
            mode: "live",
            twist: r.twist,
            id: `${turn - 1}-${n % 3}`,
            turn,
            agent,
            stance: d.stance,
            action: d.action,
            place: d.place,
            agreement: d.agreement,
            consensus,
            text: d.text,
          };
        } catch (e) {
          setError((e as Error).message);
          setPhase("running");
          return;
        }
      }

      const all = [...prev, entry];
      setEntries(all);
      if (entry.action === "bark") {
        setShake(true);
        setTimeout(() => setShake(false), 700);
      }

      // Is the negotiation over?
      let over = false;
      if (r.mode === "scripted") {
        over = all.length === TOTAL_BEATS;
      } else if (all.length % 3 === 0) {
        const turn = all.length / 3;
        const lat = latestAgreement(all);
        const agreed = DECIDERS.every((a) => (lat[a] ?? 0) >= AGREE_AT);
        over = (agreed && turn >= 2) || turn >= MAX_TURNS;
      }
      if (over) await finish(r, all);
      else setPhase("running");
    },
    [finish],
  );

  const advance = useCallback(() => {
    if (phase === "thinking" || phase === "finalizing" || !live) return;
    if (phase === "idle" || phase === "done") {
      const isLive = live.live;
      const t = TWISTS[Math.floor(Math.random() * TWISTS.length)];
      const r: Run = isLive
        ? { id: newRunId(), mode: "live", twist: t.text, weather: t.weather, closed: t.closed }
        : { id: newRunId(), mode: "scripted", twist: SCRIPTED_TWIST, weather: "sun" };
      setRun(r);
      setEntries([]);
      setFinal(null);
      setError(null);
      void step(r, []);
      return;
    }
    if (run) void step(run, entries);
  }, [phase, live, run, entries, step]);

  // Auto-play: advance a few seconds after each line.
  useEffect(() => {
    if (!auto || phase !== "running") return;
    const t = setTimeout(advance, 3500);
    return () => clearTimeout(t);
  }, [auto, phase, advance]);

  // Space and right arrow advance one line.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const download = () => {
    const blob = new Blob([toJsonl(entries)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decisions.jsonl";
    a.click();
    URL.revokeObjectURL(url);
  };

  // What is on screen right now.
  const last = entries[entries.length - 1];
  const thinkingAgent = phase === "thinking" ? ORDER[entries.length % 3] : null;
  const shown: ShownLine | null = thinkingAgent
    ? {
        key: `think-${entries.length}`,
        turn: Math.floor(entries.length / 3) + 1,
        title: "Thinking",
        agent: thinkingAgent,
        text: "",
      }
    : last
      ? { key: `${last.run_id}-${last.id}`, turn: last.turn, title: titleFor(last), agent: last.agent, text: last.text }
      : null;
  // Each character keeps doing its most recent action (e.g. Ziggy stays sulking).
  const lastAction: Partial<Record<AgentId, LogEntry>> = {};
  for (const e of entries) lastAction[e.agent] = e;
  const speaking = thinkingAgent ?? last?.agent ?? null;

  const busy = phase === "thinking" || phase === "finalizing";
  const label = phase === "idle" ? "Start" : phase === "done" ? "New run" : busy ? "…" : "Next";
  const progress =
    run?.mode === "scripted"
      ? `${entries.length}/${TOTAL_BEATS}`
      : run
        ? `Round ${Math.min(Math.floor(entries.length / 3) + 1, MAX_TURNS)} of ${MAX_TURNS}`
        : "";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div
          className={`relative h-[560px] overflow-hidden rounded-2xl border border-stone-700 ${
            shake ? "stage-shake" : ""
          }`}
        >
          <World weather={run?.weather ?? "sun"} closed={run?.closed} sunset={false} focus={last?.place ?? null} />

          {shake && (
            <div className="veto-flash pointer-events-none absolute inset-0 z-40 bg-purple-700/40" />
          )}

          {shown ? (
            <SpeechBubble line={shown} thinking={!!thinkingAgent} />
          ) : (
            <div className="absolute inset-x-0 top-16 z-30 text-center">
              <div className="mx-auto inline-block rounded-2xl bg-white/90 px-6 py-4 shadow-lg">
                <div className="text-2xl font-bold text-stone-900">Ziggy&apos;s Day</div>
                <div className="text-sm text-stone-600">
                  Two adults decide the day. One dog reacts. Nothing is scripted.
                </div>
              </div>
            </div>
          )}

          {run && (
            <div className="absolute right-3 top-[150px] z-20 max-w-[60%] rounded-lg bg-stone-900/80 px-3 py-1.5 text-xs text-stone-100">
              <span className="font-semibold">Today:</span> {run.twist}
            </div>
          )}

          {CAST.map((a) => {
            const state = !speaking ? "idle" : speaking === a.id ? "speaking" : "dim";
            const act = lastAction[a.id];
            // Stand at the place from your latest line; share the spot politely.
            const place = act?.place ?? "home";
            const here = CAST.filter((c) => (lastAction[c.id]?.place ?? "home") === place);
            const offset = (here.indexOf(a) - (here.length - 1) / 2) * 84;
            return (
              <CharacterSlot
                key={a.id}
                agent={a}
                left={`calc(${PLACES[place].x}% + ${offset}px)`}
                state={state}
                action={act?.action}
                actionKey={act ? `${act.run_id}-${act.id}` : "none"}
              />
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={advance}
            disabled={busy || !live}
            className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {label}
          </button>
          <label className="flex items-center gap-1.5 text-xs text-stone-400">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            Auto-play
          </label>
          <span className="text-xs text-stone-500">
            Space or → also works{progress ? ` · ${progress}` : ""}
          </span>
          <span
            className={`ml-auto rounded px-2 py-0.5 text-[11px] font-semibold ${
              live?.live ? "bg-emerald-800 text-emerald-100" : "bg-stone-700 text-stone-300"
            }`}
          >
            {live === null ? "…" : live.live ? `Live agents · ${live.provider}` : "Scripted (no API key)"}
          </span>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-400">
            Agent call failed: {error}. Press Next to retry.
          </p>
        )}
      </div>

      <DecisionLog entries={entries} final={final} onDownload={download} />
    </div>
  );
}
