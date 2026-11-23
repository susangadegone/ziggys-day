import type { AgentId, Beat } from "./script";

// One row of decisions.jsonl. Bruin reads exactly this shape.
export interface LogEntry {
  id: string;
  turn: number;
  agent: AgentId;
  stance: string;
  veto: boolean;
  consensus: number;
  text: string;
}

export function entryFromBeat(b: Beat, consensus: number): LogEntry {
  return {
    id: `${b.turnIndex}-${b.lineIndex}`,
    turn: b.turn,
    agent: b.line.agent,
    stance: b.line.stance,
    veto: !!b.line.veto,
    consensus,
    text: b.line.text,
  };
}

export function toJsonl(entries: LogEntry[]): string {
  return entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
}
