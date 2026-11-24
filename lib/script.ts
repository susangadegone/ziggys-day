// Cast, actions, and the SCRIPTED FALLBACK used only when no model key is set.
// With a key, the agents improvise every line live (see lib/personas.ts).

export type AgentId = "angie" | "rob" | "ziggy";

// Every line comes with a physical action, which the stage animates.
export const ADULT_ACTIONS = ["excited", "firm", "annoyed", "concede", "happy", "thinking"] as const;
export const DOG_ACTIONS = ["door", "sniff", "bark", "sulk", "wag", "flop", "zoomies"] as const;
export type Action = (typeof ADULT_ACTIONS)[number] | (typeof DOG_ACTIONS)[number];

import type { PlaceId } from "./world";

export interface Line {
  agent: AgentId;
  place: PlaceId; // where the character heads while saying/doing this
  text: string; // adults speak; Ziggy's text is an *action* description
  stance: string; // short label for the log panel
  action: Action;
}

export interface Turn {
  turn: number;
  title: string;
  consensus: number; // 0..1, how close to agreement after this turn
  lines: Line[];
}

export const SCRIPT: Turn[] = [
  {
    turn: 1,
    title: "Opening bids",
    consensus: 0.15,
    lines: [
      { agent: "angie", place: "beach", action: "excited", stance: "Proposes full adventure day",
        text: "Beach at nine, the long trail at eleven, dog park at two. Perfect day, and I've color-coded it." },
      { agent: "rob", place: "home", action: "firm", stance: "Proposes calm day at home",
        text: "I have a deadline at five. A calm day at home protects it. That's the entire plan." },
      { agent: "ziggy", place: "trail", action: "door", stance: "Wants out, now",
        text: "*sprints to the door and sits, staring hard at the leash*" },
    ],
  },
  {
    turn: 2,
    title: "Pushback",
    consensus: 0.3,
    lines: [
      { agent: "angie", place: "park", action: "firm", stance: "Defends three-stop itinerary",
        text: "Three stops isn't rushing. Three stops is momentum." },
      { agent: "rob", place: "home", action: "annoyed", stance: "Flags deadline risk",
        text: "Three stops is three car rides and three chances I miss my deadline." },
      { agent: "ziggy", place: "trail", action: "sniff", stance: "Refuses to be hurried",
        text: "*plants his nose in the first bush by the door and will not be rushed*" },
    ],
  },
  {
    turn: 3,
    title: "First compromises",
    consensus: 0.45,
    lines: [
      { agent: "angie", place: "trail", action: "concede", stance: "Concedes: drops dog park",
        text: "Fine. Two stops. Trail and beach. I'll drop the park." },
      { agent: "rob", place: "home", action: "firm", stance: "Counters: backyard only",
        text: "Backyard. Twenty minutes. I keep my morning." },
      { agent: "ziggy", place: "home", action: "sulk", stance: "Rejects backyard",
        text: "*looks at the backyard, looks at Rob, lies down with a long sigh*" },
    ],
  },
  {
    turn: 4,
    title: "The protest",
    consensus: 0.4,
    lines: [
      { agent: "angie", place: "beach", action: "excited", stance: "Re-proposes full-day loop",
        text: "Then the full loop: trail, beach, lunch on the pier, back by dark." },
      { agent: "rob", place: "home", action: "annoyed", stance: "Objects to evening return",
        text: "Back by dark means I work at midnight. No." },
      { agent: "ziggy", place: "trail", action: "bark", stance: "Protests: a walk, not a road trip",
        text: "*barks once, loudly, and drops his leash on Rob's feet*" },
    ],
  },
  {
    turn: 5,
    title: "Reading Ziggy",
    consensus: 0.75,
    lines: [
      { agent: "angie", place: "trail", action: "thinking", stance: "Reads Ziggy: one long walk",
        text: "He wants one long walk, not a tour. Trail only, unlimited sniffing, home by noon?" },
      { agent: "rob", place: "home", action: "concede", stance: "Accepts: protected work block",
        text: "Home by noon, quiet from one to five. Deadline protected. I accept." },
      { agent: "ziggy", place: "trail", action: "wag", stance: "Approves the trail",
        text: "*tail going in full circles, already halfway out the door*" },
    ],
  },
  {
    turn: 6,
    title: "Decision",
    consensus: 0.95,
    lines: [
      { agent: "angie", place: "beach", action: "happy", stance: "Adds sunset beach bonus",
        text: "And thirty minutes of sunset beach as a bonus. Not a stop. A bonus." },
      { agent: "rob", place: "home", action: "happy", stance: "Approves final plan",
        text: "A trail, a nap, a sunset. Approved." },
      { agent: "ziggy", place: "home", action: "flop", stance: "Signs off with a nap",
        text: "*flops onto Rob's feet and is asleep before anyone can move*" },
    ],
  },
];

// One beat is one line. The Next button walks this array.
export interface Beat {
  turnIndex: number;
  turn: number;
  lineIndex: number;
  line: Line;
  closesTurn: boolean;
}

export const BEATS: Beat[] = SCRIPT.flatMap((t, turnIndex) =>
  t.lines.map((line, lineIndex) => ({
    turnIndex,
    turn: t.turn,
    lineIndex,
    line,
    closesTurn: lineIndex === t.lines.length - 1,
  })),
);

export const TOTAL_BEATS = BEATS.length; // 18

// The scripted final decision record.
export const FINAL_DECISION = {
  plan: "One long trail walk with unlimited sniffing, home by noon. Quiet work block for Rob from 1 to 5 while Ziggy naps. Thirty minutes of sunset beach as a bonus.",
  timeline: [
    { time: "8:30", what: "Trail walk, Ziggy sets the pace", place: "trail" },
    { time: "11:45", what: "Home", place: "home" },
    { time: "1:00–5:00", what: "Rob's work block, Ziggy naps", place: "home" },
    { time: "5:45", what: "Sunset beach, 30 minutes", place: "beach" },
  ],
  winner: "ziggy",
  why: "The whole day was built around his one long walk and his nap.",
  satisfaction: [
    { agent: "angie" as AgentId, score: 0.8 },
    { agent: "rob" as AgentId, score: 0.85 },
    { agent: "ziggy" as AgentId, score: 0.95 },
  ],
};
