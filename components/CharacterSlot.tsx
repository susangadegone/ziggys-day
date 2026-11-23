"use client";

import { useState } from "react";
import type { Agent, Character } from "@/lib/agents";

type State = "idle" | "speaking" | "dim";

function PersonSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 200" className="h-44 w-auto" aria-hidden>
      <circle cx="60" cy="40" r="26" fill="#F2C9A0" />
      <rect x="26" y="74" width="68" height="110" rx="30" fill={color} />
      <rect x="40" y="170" width="14" height="28" rx="6" fill="#334155" />
      <rect x="66" y="170" width="14" height="28" rx="6" fill="#334155" />
    </svg>
  );
}

function DogSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 160" className="h-36 w-auto" aria-hidden>
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

function AvatarFallback({ color, name }: { color: string; name: string }) {
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {name[0]}
    </div>
  );
}

export default function CharacterSlot({
  character,
  agent,
  state,
}: {
  character: Character;
  agent: Agent;
  state: State;
}) {
  const [charFailed, setCharFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const speaking = state === "speaking";
  const dim = state === "dim";

  return (
    <div
      className="absolute bottom-4 z-10 flex flex-col items-center"
      style={{
        left: character.left,
        transformOrigin: "bottom center",
        transform: `translateX(-50%) translateY(${speaking ? "-12px" : "0px"}) scale(${speaking ? 1.07 : 1})`,
        opacity: dim ? 0.42 : 1,
        filter: dim ? "saturate(0.45)" : "none",
        transition: "all 500ms ease-out",
      }}
    >
      {/* Agent avatar floats above its owner */}
      <div className={`relative mb-2 ${speaking ? "floaty" : ""}`}>
        <div
          className="overflow-hidden rounded-full border-4 bg-white"
          style={{ borderColor: agent.color }}
        >
          {avatarFailed ? (
            <AvatarFallback color={agent.color} name={agent.name} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agent.img}
              alt={agent.name}
              className="h-16 w-16 object-cover"
              onError={() => setAvatarFailed(true)}
            />
          )}
        </div>
        {agent.id === "ziggy" && (
          <span className="absolute -right-6 -top-1 rounded bg-purple-700 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">
            VETO
          </span>
        )}
        <div
          className="mt-1 text-center text-xs font-bold"
          style={{ color: agent.color }}
        >
          {agent.name}
        </div>
      </div>

      {/* The person or dog */}
      {charFailed ? (
        character.kind === "dog" ? (
          <DogSVG color={character.color} />
        ) : (
          <PersonSVG color={character.color} />
        )
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={character.img}
          alt={character.name}
          className="h-44 w-auto object-contain"
          onError={() => setCharFailed(true)}
        />
      )}
      <div className="mt-1 rounded-full bg-black/40 px-3 py-0.5 text-xs font-semibold text-white">
        {character.name}
      </div>
    </div>
  );
}
