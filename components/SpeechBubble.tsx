import { AGENTS } from "@/lib/agents";
import type { AgentId } from "@/lib/script";

export interface ShownLine {
  key: string;
  turn: number;
  title: string;
  agent: AgentId;
  text: string;
}

export default function SpeechBubble({ line, thinking }: { line: ShownLine; thinking?: boolean }) {
  const agent = AGENTS[line.agent];
  const isDog = agent.kind === "dog";

  return (
    <div key={line.key + (thinking ? "-t" : "")} className="bubble-in absolute inset-x-0 top-5 z-30">
      <div
        className={`mx-[4%] rounded-2xl border-2 px-5 py-4 shadow-lg ${isDog ? "border-dashed bg-purple-50/95" : "bg-white/95"}`}
        style={{ borderColor: agent.color }}
      >
        <div
          className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
          style={{ color: agent.color }}
        >
          {agent.name}
          {isDog && <span className="font-normal normal-case text-stone-500">(reacts)</span>}
          <span className="ml-auto text-stone-400">
            Round {line.turn} · {line.title}
          </span>
        </div>
        {thinking ? (
          <p className="text-lg italic leading-snug text-stone-400">
            {isDog ? "watching…" : "thinking…"}
          </p>
        ) : (
          <p className={`text-lg leading-snug text-stone-900 ${isDog ? "italic" : ""}`}>
            {isDog ? line.text.replace(/^\*|\*$/g, "") : line.text}
          </p>
        )}
      </div>
      {/* Tail pointing at the speaker's column */}
      <span
        className={`absolute -bottom-2 h-4 w-4 border-b-2 border-r-2 ${isDog ? "bg-purple-50" : "bg-white"}`}
        style={{
          left: agent.left,
          borderColor: agent.color,
          transform: "translateX(-50%) rotate(45deg)",
        }}
      />
    </div>
  );
}
