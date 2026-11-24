"use client";

import { useEffect, useRef, useState } from "react";
import type { Agent } from "@/lib/agents";
import type { Action } from "@/lib/script";

type State = "idle" | "speaking" | "dim";

function PersonSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 200" className="h-28 w-auto" aria-hidden>
      <circle cx="60" cy="40" r="26" fill="#F2C9A0" />
      <rect x="26" y="74" width="68" height="110" rx="30" fill={color} />
      <rect x="40" y="170" width="14" height="28" rx="6" fill="#334155" />
      <rect x="66" y="170" width="14" height="28" rx="6" fill="#334155" />
    </svg>
  );
}

function DogSVG() {
  const color = "#A16207";
  return (
    <svg viewBox="0 0 200 160" className="h-16 w-auto" aria-hidden>
      <ellipse cx="95" cy="100" rx="62" ry="34" fill={color} />
      <circle cx="152" cy="68" r="28" fill={color} />
      <ellipse cx="136" cy="50" rx="10" ry="20" fill="#78350F" transform="rotate(-20 136 50)" />
      <ellipse cx="170" cy="50" rx="10" ry="20" fill="#78350F" transform="rotate(20 170 50)" />
      <circle cx="158" cy="64" r="4" fill="#111" />
      <circle cx="174" cy="76" r="5" fill="#111" />
      <path d="M36 88 Q10 60 24 40" stroke={color} strokeWidth="12" fill="none" strokeLinecap="round" />
      <rect x="52" y="120" width="14" height="30" rx="6" fill={color} />
      <rect x="116" y="120" width="14" height="30" rx="6" fill={color} />
    </svg>
  );
}

export default function CharacterSlot({
  agent,
  state,
  action,
  actionKey,
  left,
}: {
  agent: Agent;
  left: string; // where on the path this character stands
  state: State;
  action?: Action;
  actionKey?: string; // changes each line, so the animation replays
}) {
  const [imgFailed, setImgFailed] = useState(false);
  // Bob up and down while walking to a new place.
  const [walking, setWalking] = useState(false);
  const prevLeft = useRef(left);
  useEffect(() => {
    if (prevLeft.current === left) return;
    prevLeft.current = left;
    setWalking(true);
    const t = setTimeout(() => setWalking(false), 1400);
    return () => clearTimeout(t);
  }, [left]);
  const speaking = state === "speaking";
  const dim = state === "dim";

  return (
    <div
      className="absolute bottom-3 z-10 flex flex-col items-center"
      style={{
        left,
        transformOrigin: "bottom center",
        transform: `translateX(-50%) scale(${speaking ? 1.06 : 1})`,
        opacity: dim ? 0.55 : 1,
        filter: dim ? "saturate(0.5)" : "none",
        transition: "left 1.4s ease-in-out, transform 500ms ease-out, opacity 500ms, filter 500ms",
        zIndex: speaking ? 20 : 10,
      }}
    >
      <div className={walking ? "walking" : ""}>
      {/* The body: replays its action animation on every new line */}
      <div key={actionKey} className={action ? `act act-${action}` : ""}>
        {imgFailed ? (
          agent.kind === "dog" ? <DogSVG /> : <PersonSVG color={agent.color} />
        ) : (
          // Portrait card: the picture cropped into a frame in the character's color.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={agent.img}
            alt={agent.name}
            className={`${agent.kind === "dog" ? "h-[72px] w-[72px]" : "h-28 w-20"} rounded-xl border-[3px] object-cover shadow-lg`}
            style={{ borderColor: agent.color, objectPosition: agent.imgPos }}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      <div
        className="mt-1 whitespace-nowrap rounded-full border-2 bg-black/55 px-2 py-0 text-center text-xs font-semibold text-white"
        style={{ borderColor: agent.color }}
      >
        {agent.name}
      </div>
      </div>
    </div>
  );
}
