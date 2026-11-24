"use client";

import { useEffect, useRef } from "react";
import { AGENTS } from "@/lib/agents";
import type { AgentId } from "@/lib/script";
import type { LogEntry } from "@/lib/log";

export interface FinalRecord {
  plan: string;
  timeline: { time: string; what: string }[];
  satisfaction: { agent: AgentId; score: number }[];
  winner?: string;
  why?: string;
  twist: string;
}

export default function DecisionLog({
  entries,
  final,
  onDownload,
}: {
  entries: LogEntry[];
  final: FinalRecord | null;
  onDownload: () => void;
}) {
  const finished = !!final;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length, finished]);

  return (
    <aside className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-stone-700 bg-stone-900">
      <div className="flex items-center justify-between border-b border-stone-700 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Decision log</div>
          <div className="font-mono text-xs text-stone-400">decisions.jsonl</div>
        </div>
        <div className="text-xs text-stone-400">
          {entries.length} lines
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {entries.length === 0 && (
          <p className="text-sm text-stone-500">Each spoken line is logged here.</p>
        )}
        <ul className="space-y-2">
          {entries.map((e) => {
            const a = AGENTS[e.agent];
            return (
              <li key={e.id} className="log-in rounded-lg bg-stone-800 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-stone-500">T{e.turn}</span>
                  <span className="font-semibold" style={{ color: a.color }}>
                    {a.name}
                  </span>
                  <span className="rounded bg-stone-700 px-1.5 py-0.5 text-[10px] text-stone-300">
                    {e.action} · {e.place}
                  </span>
                  <span className="ml-auto font-mono text-xs text-stone-400">
                    {e.consensus.toFixed(2)}
                  </span>
                </div>
                <div className="mt-0.5 flex text-stone-300">
                  <span>{e.stance}</span>
                  <span className="ml-auto pl-2 font-mono text-[10px] text-stone-500" title="This agent's own satisfaction">
                    {Math.round(e.agreement * 100)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {final && (
          <div className="log-in mt-3 rounded-xl border border-emerald-600/60 bg-emerald-950/40 p-3 text-sm">
            <div className="mb-1 font-semibold text-emerald-300">Final decision record</div>
            <p className="text-stone-200">{final.plan}</p>
            {final.winner && AGENTS[final.winner as AgentId] && (
              <p className="mt-1 text-xs text-stone-300">
                Day goes to{" "}
                <span className="font-semibold" style={{ color: AGENTS[final.winner as AgentId].color }}>
                  {AGENTS[final.winner as AgentId].name}
                </span>
                {final.why ? `: ${final.why}` : ""}
              </p>
            )}
            <table className="mt-2 w-full text-xs text-stone-300">
              <tbody>
                {final.timeline.map((t) => (
                  <tr key={t.time + t.what}>
                    <td className="py-0.5 pr-2 font-mono text-stone-400">{t.time}</td>
                    <td>{t.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 space-y-1.5">
              {final.satisfaction.map((s) => {
                const a = AGENTS[s.agent];
                return (
                  <div key={s.agent} className="flex items-center gap-2 text-xs">
                    <span className="w-20" style={{ color: a.color }}>
                      {a.name}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded bg-stone-700">
                      <div
                        className="h-full rounded"
                        style={{ width: `${s.score * 100}%`, backgroundColor: a.color }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-stone-400">
                      {s.score.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-stone-700 p-3">
        <button
          onClick={onDownload}
          disabled={entries.length === 0}
          className="w-full rounded-lg border border-stone-600 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 disabled:opacity-40"
        >
          Download decisions.jsonl
        </button>
      </div>
    </aside>
  );
}
