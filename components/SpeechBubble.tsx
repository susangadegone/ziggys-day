import { AGENTS } from "@/lib/agents";
import { SCRIPT, type Beat } from "@/lib/script";

export default function SpeechBubble({ beat }: { beat: Beat }) {
  const agent = AGENTS[beat.line.agent];
  const key = `${beat.turnIndex}-${beat.lineIndex}`;

  return (
    <div key={key} className="bubble-in absolute inset-x-0 top-5 z-30">
      <div
        className="mx-[4%] rounded-2xl border-2 bg-white/95 px-5 py-4 shadow-lg"
        style={{ borderColor: agent.color }}
      >
        <div
          className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
          style={{ color: agent.color }}
        >
          {agent.name}
          {beat.line.veto && (
            <span className="rounded bg-purple-700 px-1.5 py-0.5 text-white">VETO</span>
          )}
          <span className="ml-auto text-stone-400">
            Turn {beat.turn} · {SCRIPT[beat.turnIndex].title}
          </span>
        </div>
        <p className="text-lg leading-snug text-stone-900">{beat.line.text}</p>
      </div>
      {/* Tail pointing at the speaker's column */}
      <span
        className="absolute -bottom-2 h-4 w-4 border-b-2 border-r-2 bg-white"
        style={{
          left: agent.left,
          borderColor: agent.color,
          transform: "translateX(-50%) rotate(45deg)",
        }}
      />
    </div>
  );
}
