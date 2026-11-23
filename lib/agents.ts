import type { AgentId } from "./script";

export interface Agent {
  id: AgentId;
  name: string;
  belongsTo: string;
  color: string;
  left: string; // column on the stage
  img: string;
}

export const AGENTS: Record<AgentId, Agent> = {
  sunny: {
    id: "sunny",
    name: "Sunny",
    belongsTo: "Angie",
    color: "#D97706",
    left: "16.67%",
    img: "/art/sunny.png",
  },
  ziggy: {
    id: "ziggy",
    name: "Ziggy Prime",
    belongsTo: "Ziggy",
    color: "#7E22CE",
    left: "50%",
    img: "/art/ziggy-prime.png",
  },
  couch: {
    id: "couch",
    name: "Couch",
    belongsTo: "Dough",
    color: "#2563EB",
    left: "83.33%",
    img: "/art/couch.png",
  },
};

export interface Character {
  id: "angie" | "ziggy" | "dough";
  name: string;
  kind: "person" | "dog";
  agent: AgentId;
  left: string;
  img: string;
  color: string;
}

export const CHARACTERS: Character[] = [
  { id: "angie", name: "Angie", kind: "person", agent: "sunny", left: "16.67%", img: "/art/angie.png", color: "#F59E0B" },
  { id: "ziggy", name: "Ziggy", kind: "dog", agent: "ziggy", left: "50%", img: "/art/ziggy.png", color: "#A16207" },
  { id: "dough", name: "Dough", kind: "person", agent: "couch", left: "83.33%", img: "/art/dough.png", color: "#3B82F6" },
];
