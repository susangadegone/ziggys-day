"use client";

import { useCallback, useEffect, useState } from "react";
import { BEATS, SCRIPT, TOTAL_BEATS } from "@/lib/script";
import { AGENTS, CHARACTERS } from "@/lib/agents";
import { entryFromBeat, toJsonl, type LogEntry } from "@/lib/log";
import CharacterSlot from "./CharacterSlot";
import SpeechBubble from "./SpeechBubble";
import DecisionLog from "./DecisionLog";

export default function Stage() {
  const [beatIndex, setBeatIndex] = useState(0);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [shake, setShake] = useState(false);
  const [started, setStarted] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  const finished = started && beatIndex === TOTAL_BEATS - 1;
  const current = started ? BEATS[beatIndex] : null;

  const advance = useCallback(() => {
    if (!started) {
      setStarted(true); // first press reveals beat 0
      return;
    }
    if (beatIndex >= TOTAL_BEATS - 1) {
      // replay
      setStarted(false);
      setBeatIndex(0);
      setEntries([]);
      return;
    }
    setBeatIndex((i) => Math.min(i + 1, TOTAL_BEATS - 1));
  }, [started, beatIndex]);

  // Append the log entry for the current beat and shake on veto.
  useEffect(() => {
    if (!started) return;
    const b = BEATS[beatIndex];
    setEntries((prev) => {
      const id = `${b.turnIndex}-${b.lineIndex}`;
      if (prev.some((p) => p.id === id)) return prev; // idempotent in dev
      return [...prev, entryFromBeat(b, SCRIPT[b.turnIndex].consensus)];
    });
    if (b.line.veto) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 700);
      return () => clearTimeout(t);
    }
  }, [beatIndex, started]);

  // When the film ends, ask the dev server to write decisions.jsonl.
  // This only works locally (npm run dev); failures are ignored.
  useEffect(() => {
    if (finished && entries.length === TOTAL_BEATS) {
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries),
      }).catch(() => {});
    }
  }, [finished, entries]);

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

  const label = !started ? "Start" : finished ? "Replay" : "Next";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div
          className={`relative h-[560px] overflow-hidden rounded-2xl border border-stone-700 ${
            shake ? "stage-shake" : ""
          }`}
          style={{
            background:
              "linear-gradient(to bottom, #E7DCCB 0%, #D9C9B0 62%, #8B6B4A 62%, #6B4F36 100%)",
          }}
        >
          {!bgFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/art/living-room.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setBgFailed(true)}
            />
          )}

          {shake && (
            <div className="veto-flash pointer-events-none absolute inset-0 z-40 bg-purple-700/40" />
          )}

          {current ? (
            <SpeechBubble beat={current} />
          ) : (
            <div className="absolute inset-x-0 top-16 z-30 text-center">
              <div className="mx-auto inline-block rounded-2xl bg-white/90 px-6 py-4 shadow-lg">
                <div className="text-2xl font-bold text-stone-900">Ziggy&apos;s Day</div>
                <div className="text-sm text-stone-600">
                  Three agents. One dog. One decision log.
                </div>
              </div>
            </div>
          )}

          {CHARACTERS.map((c) => {
            const state = !current
              ? "idle"
              : current.line.agent === c.agent
                ? "speaking"
                : "dim";
            return (
              <CharacterSlot key={c.id} character={c} agent={AGENTS[c.agent]} state={state} />
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={advance}
            className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500"
          >
            {label}
          </button>
          <span className="text-xs text-stone-500">
            Space or → also works · {started ? beatIndex + 1 : 0}/{TOTAL_BEATS}
          </span>
        </div>
      </div>

      <DecisionLog entries={entries} finished={finished} onDownload={download} />
    </div>
  );
}
