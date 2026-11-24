import type { PlaceId } from "./world";
import { FINAL_DECISION, SCRIPT, type Action, type AgentId, type Beat } from "./script";

// One row of decisions.jsonl. Bruin reads exactly this shape.
// Every run is appended with its own run_id, so runs can be compared.
export interface LogEntry {
  run_id: string;
  mode: "live" | "scripted";
  twist: string;
  id: string;
  turn: number;
  agent: AgentId;
  stance: string;
  action: Action; // what the character physically does on screen
  place: PlaceId; // where the character went
  agreement: number; // how satisfied this agent is with the plan on the table
  consensus: number; // group average after this line
  text: string;
}

export const SCRIPTED_TWIST = "Scripted run (no live model)";

export function entryFromBeat(b: Beat, runId: string): LogEntry {
  const lastTurn = b.turnIndex === SCRIPT.length - 1;
  const consensus = SCRIPT[b.turnIndex].consensus;
  const sat = FINAL_DECISION.satisfaction.find((s) => s.agent === b.line.agent)!.score;
  return {
    run_id: runId,
    mode: "scripted",
    twist: SCRIPTED_TWIST,
    id: `${b.turnIndex}-${b.lineIndex}`,
    turn: b.turn,
    agent: b.line.agent,
    stance: b.line.stance,
    action: b.line.action,
    place: b.line.place,
    agreement: lastTurn ? sat : consensus,
    consensus,
    text: b.line.text,
  };
}

export function toJsonl(entries: LogEntry[]): string {
  return entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
}

export function newRunId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
