import type { AgentId } from "./script";

// The three agents ARE the cast: two adults and their dog.
export interface Agent {
  id: AgentId;
  name: string;
  kind: "person" | "dog";
  role: string; // shown under the name
  color: string;
  left: string; // column on the stage
  img: string; // public/art/<id>.png; falls back to a drawing
  imgPos: string; // which part of the picture to show in the portrait card
}

export const AGENTS: Record<AgentId, Agent> = {
  angie: { id: "angie", name: "Angie", kind: "person", role: "wants adventure", color: "#D97706", left: "18%", img: "/art/angie.png", imgPos: "50% 35%" },
  ziggy: { id: "ziggy", name: "Ziggy", kind: "dog", role: "can't talk, reacts", color: "#7E22CE", left: "50%", img: "/art/ziggy.png", imgPos: "49% 55%" },
  rob: { id: "rob", name: "Rob", kind: "person", role: "has a deadline", color: "#2563EB", left: "82%", img: "/art/rob.png", imgPos: "52% 25%" },
};

export const CAST: Agent[] = [AGENTS.angie, AGENTS.ziggy, AGENTS.rob];
