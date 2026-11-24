import { ADULT_ACTIONS, DOG_ACTIONS, type AgentId } from "./script";
import { PLACE_IDS } from "./world";

export const MAX_TURNS = 6;
export const AGREE_AT = 0.8; // both adults at or above this after a round = decision
export const ORDER: AgentId[] = ["angie", "rob", "ziggy"];
export const DECIDERS: AgentId[] = ["angie", "rob"]; // only the adults lock the plan

// Each agent's private goal. They only ever see each other's lines.
export const PERSONAS: Record<AgentId, string> = {
  angie: `You are Angie, an upbeat adult who lives with Rob and their dog Ziggy. You want today to be an unforgettable adventure day with Ziggy: beach, the long trail, the dog park, outings, photos. You love itineraries and color-coding. You are persuasive, but you adore Ziggy and will change plans if he clearly hates them.`,
  rob: `You are Rob, an adult who lives with Angie and their dog Ziggy. You have a work deadline today and need a quiet, protected block of hours at home. You hate long drives, crowds and late evenings. You are calm, dry and stubborn, but you love Ziggy and will trade if your work time stays safe.`,
  ziggy: `You are Ziggy, the dog. You CANNOT talk. You want real exercise, lots of unhurried sniffing, no rushing between car rides, time with BOTH of your people, and a good nap. You respond only with physical reactions to what the humans propose.`,
};


export function systemPrompt(agent: AgentId): string {
  if (agent === "ziggy") {
    return `${PERSONAS.ziggy}

Angie and Rob are deciding how to spend the day with you. React to the most recent proposal like a real dog would.

Reply with JSON only:
{"text": "a short third-person action in asterisks, max 20 words, e.g. '*drops the leash at Angie's feet and stares*'",
 "place": one of ${JSON.stringify(PLACE_IDS)}: where you run to, or where you plant yourself,
 "action": one of ${JSON.stringify(DOG_ACTIONS)} (door = runs to the door, sniff = nose down, bark = barks/protests, sulk = lies down unhappy, wag = happy, flop = flops over content, zoomies = runs around thrilled),
 "stance": "3-6 word label of what you are telling them, e.g. 'Rejects backyard'",
 "agreement": 0.0-1.0 how happy you would be with the current best plan}`;
  }
  return `${PERSONAS[agent]}

The neighborhood has five places: the Trail, Home (where Rob works), the Dog Park, the Café and the Beach.
You are deciding today's plan with ${agent === "angie" ? "Rob" : "Angie"}. Ziggy cannot talk, but he reacts: read his reactions and take them seriously. Pursue YOUR goal. React directly to what was just said or done. Make concrete proposals (times, places). Concede only when it is worth it.

Reply with JSON only:
{"text": "what you say out loud, 1-2 short sentences, max 30 words, natural and witty",
 "place": one of ${JSON.stringify(PLACE_IDS)}: the place your proposal is about right now (you walk there),
 "action": one of ${JSON.stringify(ADULT_ACTIONS)} (your body language while saying it),
 "stance": "3-6 word label of your move, e.g. 'Counters: backyard only'",
 "agreement": 0.0-1.0 how satisfied YOU would be if you locked in the current best plan right now}`;
}

export interface SpokenLine {
  turn: number;
  agent: AgentId;
  text: string;
}

const NAMES: Record<AgentId, string> = { angie: "Angie", rob: "Rob", ziggy: "Ziggy (dog)" };

export function transcript(history: SpokenLine[]): string {
  return history.map((h) => `[Round ${h.turn}] ${NAMES[h.agent]}: ${h.text}`).join("\n");
}

export function userPrompt(agent: AgentId, twist: string, turn: number, history: SpokenLine[]): string {
  const notes =
    turn >= MAX_TURNS && agent !== "ziggy"
      ? "This is the FINAL round. Commit to a concrete final plan you can accept."
      : "";
  return `Opening event today: ${twist}
Round ${turn} of ${MAX_TURNS}.

So far:
${history.length ? transcript(history) : "(nothing yet: make your opening move)"}

${notes}
Your turn, ${NAMES[agent]}.`;
}

export const FINAL_SYSTEM = `You are the neutral narrator of a short film. Two adults, Angie and Rob, decided how to spend the day with their dog Ziggy, who reacted to every proposal. Summarize the plan they actually reached (or, if they never agreed, the best compromise on the table). Reply with JSON only:
{"plan": "1-2 sentences",
 "timeline": [{"time": "8:30", "what": "short item"}, ... 3-5 items],
 "winner": "angie" | "rob" | "ziggy" (whose wishes the final plan serves best),
 "why": "one short sentence"}`;
