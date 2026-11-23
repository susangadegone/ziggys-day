// THE SPINE. Every line of dialogue, stance, consensus value and the final
// decision lives here. Nothing else in the app contains dialogue.

export type AgentId = "sunny" | "couch" | "ziggy";

export interface Line {
  agent: AgentId;
  text: string;
  stance: string; // short label for the log panel
  veto?: boolean; // Ziggy Prime exercising veto: shakes the stage
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
      {
        agent: "sunny",
        text: "Beach at nine, the long trail at eleven, dog park at two. It's a perfect day and I have it color-coded.",
        stance: "Proposes full adventure day",
      },
      {
        agent: "couch",
        text: "Dough has a deadline at five. A calm day at home protects it. That's the entire plan.",
        stance: "Proposes calm day at home",
      },
      {
        agent: "ziggy",
        text: "I'd like a real walk, a lot of smelling, and nobody hurrying me. Beyond that I have no notes.",
        stance: "States needs: exercise, smells, no rushing",
      },
    ],
  },
  {
    turn: 2,
    title: "Pushback",
    consensus: 0.3,
    lines: [
      {
        agent: "sunny",
        text: "Three stops isn't rushing. Three stops is momentum.",
        stance: "Defends three-stop itinerary",
      },
      {
        agent: "couch",
        text: "Three stops is three car rides, three leashes, and three chances Dough misses his deadline.",
        stance: "Flags deadline risk",
      },
      {
        agent: "ziggy",
        text: "Momentum is what people call it when the dog isn't allowed to finish smelling.",
        stance: "Objects to pace",
      },
    ],
  },
  {
    turn: 3,
    title: "First compromises",
    consensus: 0.45,
    lines: [
      {
        agent: "sunny",
        text: "Fine. Two stops. Trail and beach. I'll drop the park.",
        stance: "Concedes: drops dog park",
      },
      {
        agent: "couch",
        text: "Backyard. Twenty minutes. Dough keeps his morning.",
        stance: "Counters: backyard only",
      },
      {
        agent: "ziggy",
        text: "A backyard is a place I've already smelled. Try again.",
        stance: "Rejects backyard",
      },
    ],
  },
  {
    turn: 4,
    title: "The veto",
    consensus: 0.4,
    lines: [
      {
        agent: "sunny",
        text: "Then the full loop: trail, beach, lunch on the pier, back by dark.",
        stance: "Re-proposes full-day loop",
      },
      {
        agent: "couch",
        text: "Back by dark means Dough works at midnight. I object, quietly, on his behalf.",
        stance: "Objects to evening return",
      },
      {
        agent: "ziggy",
        text: "Veto. A day made of driving is a delivery, not a day. Start over, and this time ask me.",
        stance: "VETO: all-day loop",
        veto: true,
      },
    ],
  },
  {
    turn: 5,
    title: "Ziggy sets terms",
    consensus: 0.75,
    lines: [
      {
        agent: "ziggy",
        text: "Terms: one long trail walk, sniffing unlimited, home by noon. Then I nap on whoever is working.",
        stance: "Sets terms",
      },
      {
        agent: "couch",
        text: "Home by noon, quiet from one to five. Deadline protected. I accept.",
        stance: "Accepts: protected work block",
      },
      {
        agent: "sunny",
        text: "Beach at sunset, thirty minutes, as a bonus. Not a stop. A bonus.",
        stance: "Proposes sunset beach as bonus",
      },
    ],
  },
  {
    turn: 6,
    title: "Decision",
    consensus: 0.95,
    lines: [
      {
        agent: "sunny",
        text: "A trail, a nap, a sunset. I'd have color-coded it differently, but fine.",
        stance: "Agrees",
      },
      {
        agent: "couch",
        text: "Dough works, Ziggy sleeps, nobody drives for four hours. Approved.",
        stance: "Approves final plan",
      },
      {
        agent: "ziggy",
        text: "Smells, exercise, no rushing. Signed. Pawed. Whatever counts.",
        stance: "Signs off",
      },
    ],
  },
];

// One beat is one spoken line. The Next button walks this array.
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

// The final decision record, printed in the log panel at the end.
export const FINAL_DECISION = {
  plan: "One long trail walk with unlimited sniffing, home by noon. Quiet work block for Dough from 1 to 5 while Ziggy naps. Thirty minutes of sunset beach as a bonus.",
  timeline: [
    { time: "8:30", what: "Trail walk, Ziggy sets the pace" },
    { time: "11:45", what: "Home" },
    { time: "1:00–5:00", what: "Dough's work block, Ziggy naps" },
    { time: "5:45", what: "Sunset beach, 30 minutes" },
  ],
  satisfaction: [
    { agent: "sunny" as AgentId, score: 0.78 },
    { agent: "couch" as AgentId, score: 0.82 },
    { agent: "ziggy" as AgentId, score: 0.92 },
  ],
};
